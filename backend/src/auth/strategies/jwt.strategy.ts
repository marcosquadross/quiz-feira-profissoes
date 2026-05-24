import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwtConfig from "../config/jwt.config";
import { Inject, Injectable } from "@nestjs/common";
import { config } from 'dotenv';
config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY)
        private jwtConfiguration: ConfigType<typeof jwtConfig>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfiguration.secret as string,
            ignoreExpiration: false,
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub };
        // Verificar depois
    }
}