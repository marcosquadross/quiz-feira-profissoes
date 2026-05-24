import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';

import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { User, UserDocument } from '../modules/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    const isPasswordMatching = await compare(pass, user.password);
    if (!isPasswordMatching) throw new UnauthorizedException('Senha incorreta');

    return { id: user._id };
  }

  async login(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(user: UserDocument) {
    console.log("Gerando Token. User: ", user)
    const payload = {
      sub: user._id,
      id: user._id,
      name: user.name 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    }
  }
  async refreshToken(user: UserDocument) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateRefreshToken(user._id, hashedRefreshToken);
    return {
      id: user._id,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken) throw new UnauthorizedException('Refresh token inválido');
    const isRefreshTokenMatching = await argon2.verify(user.hashedRefreshToken, refreshToken);
    if (!isRefreshTokenMatching) throw new UnauthorizedException('Refresh token inválido');
    console.log('Refresh token válido');
    return { id: userId };
  }

  async signOut(userId: string) {
    return this.usersService.updateRefreshToken(userId, null);
  }

  async validateGoogleOAuthLogin(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.usersService.create(googleUser);
  }
}
