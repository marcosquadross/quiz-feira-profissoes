import { Controller, Get, HttpCode, HttpStatus, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard('local'))
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const token = await this.authService.login(req.user.id);
    return { id: req.user.id, token };
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signout(@Request() req) {
    return this.authService.signOut(req.user.userId);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const { accessToken, refreshToken } = await this.authService.login(req.user.id);
    // Extrai name e email do usuário autenticado
    const { name, email } = req.user;
    // Redireciona para o frontend com os tokens e dados do usuário na URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/?accessToken=${accessToken}&refreshToken=${refreshToken}&id=${req.user.id}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&prompt=select_account`
    );
  }
}
