import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { Session, SessionSchema } from './schemas/session.schema';

import { Quiz, QuizSchema } from '../quizzes/schemas/quiz.schema';
import { Response, ResponseSchema } from '../response/schemas/response.schema';

import { FileProcessingModule } from '../shared/file-processing/file-processing.module';
import { GatewayModule } from '../shared/gateway/gateway.module';
import { SessionGateway } from './session.gateway';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
    FileProcessingModule,
    GatewayModule,
    AuthModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionGateway],
  exports: [SessionService],
})
export class SessionModule {}