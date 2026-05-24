import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Inject, Injectable } from "@nestjs/common";
import refreshJwtConfig from "../config/refresh-jwt.config";
import { AuthJwtPayload } from "../types/auth-jwtPayload";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
    constructor(
        @Inject(refreshJwtConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtConfiguration.secret,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: AuthJwtPayload) {
        const refreshToken = req.get("authorization").replace("Bearer", "").trim(); // Pegando o token de refresh do header
        const userId = String(payload.sub);

        return this.authService.validateRefreshToken(userId, refreshToken);
    }
    // async validate(req: Request, payload: AuthJwtPayload) {
    //     console.log("refreshToken");
    //     const { refreshToken } = req.body; // Pegando o token de refresh do corpo da requisição
    //     const userId = payload.sub;
    
    //     return this.authService.validateRefreshToken(userId, refreshToken);
    // }
}