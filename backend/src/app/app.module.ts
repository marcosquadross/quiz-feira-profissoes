import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuizzesModule } from '../modules/quizzes/quizzes.module';
import { UsersModule } from '../modules/users/users.module';
import { AuthModule } from '../auth/auth.module';
import { GatewayModule } from '../modules/shared/gateway/gateway.module';
import { FontsModule } from '../modules/fonts/fonts.module';
import { SessionModule } from '../modules/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    QuizzesModule,
    UsersModule,
    AuthModule,
    GatewayModule,
    FontsModule,
    SessionModule,
  ],
})
export class AppModule {}
