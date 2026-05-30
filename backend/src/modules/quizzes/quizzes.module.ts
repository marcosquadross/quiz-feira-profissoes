import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { QuizzesController } from './quizzes.controller';
import { QuizService } from './quizzes.service';
import { ResponseService } from '../response/response.service';

import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Response, ResponseSchema } from '../response/schemas/response.schema';

import { FileProcessingModule } from '../shared/file-processing/file-processing.module';
import { GatewayModule } from '../shared/gateway/gateway.module';
import { AuthModule } from '../../auth/auth.module';
import { StorageService } from '../shared/storage/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
    FileProcessingModule,
    GatewayModule,
    AuthModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizService, ResponseService, StorageService],
  exports: [QuizService, ResponseService],
})
export class QuizzesModule {}
