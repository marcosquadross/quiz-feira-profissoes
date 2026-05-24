import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('create')
  async createSession(@Body() body: { quizId: string }, @Req() req) {
    const userId = req.user.userId;
    const sessionAccessId = Math.random().toString(36).substring(2, 8).toUpperCase();

    await this.sessionService.create({
      sessionAccessId,
      quiz: body.quizId,
      host: { _id: userId }, 
      createdAt: new Date(),
    });

    await this.sessionService.createLiveSession(sessionAccessId);

    return { sessionAccessId };
  }

  @Get('quiz/:quizId')
  async getSessionsByQuiz(@Param('quizId') quizId: string) {
    return this.sessionService.getSessionsByQuiz(quizId);
  }
}