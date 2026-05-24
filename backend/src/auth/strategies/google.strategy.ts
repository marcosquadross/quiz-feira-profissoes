import { Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import { ConfigType } from "@nestjs/config";
import { VerifiedCallback } from "passport-jwt";
import { AuthService } from "../auth.service";

export class GoogleStrategy extends PassportStrategy(Strategy) {

    constructor(
        @Inject(googleOauthConfig.KEY)
        private googleOauthConfiguration: ConfigType<typeof googleOauthConfig>,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: googleOauthConfiguration.clientId,
            clientSecret: googleOauthConfiguration.clientSecret,
            callbackURL: googleOauthConfiguration.callbackURL,
            // passReqToCallback: true,
            scope: ['email', 'profile'],
            authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account',
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
        const user = await this.authService.validateGoogleOAuthLogin({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: ""
        });
        done(null, user);
    }
}