import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { QuizService } from './quizzes.service';
import { ResponseService } from '../response/response.service';

import { Quiz } from './schemas/quiz.schema';
import { Question, QuestionDocument } from './schemas/question.schema';

import { Public } from '../../auth/decorators/public.decorator';
import { CreateResponseDto } from '../response/dto/create-response.dto';
import { UpdateResponseDto } from '../response/dto/update-response.dto';

import { ResponseWithQuiz, QuestionSummary } from '../response/response.interface';

@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizService,
    private readonly responseService: ResponseService,
  ) {}

  // ─── QUIZ ─────────────────────────────────────────────────────────────────────

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async finalizeQuizCreation(
    @Body('quiz') quiz: string,
    @Body('style') style: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.quizzesService.finalizeQuizCreation(
      JSON.parse(quiz),
      JSON.parse(style),
      file,
    );
  }

  @Public()
  @Get(':accessIdentifier')
  findOne(@Param('accessIdentifier') accessIdentifier: string): Promise<Quiz> {
    if (!accessIdentifier)
      throw new ForbiddenException('Informe o identificador do quiz');
    return this.quizzesService.findOne(accessIdentifier);
  }

  @Public()
  @Get('')
  async findAll(): Promise<Quiz[]> {
    return this.quizzesService.findAll();
  }

  // ✅ Nova rota — retorna quizzes com responses agregadas (para o ranking)
  @Public()
  @Get('getIds/:accessIdentifiers')
  async getQuizzesIds(@Param('accessIdentifiers') accessIdentifiers: string) {
    return this.quizzesService.findQuizzesByAccessIdentifiersWithResponses(
      accessIdentifiers.split(','),
    );
  }

  @Get('user/:userId')
  async findQuizzesByUser(@Param('userId') userId: string): Promise<Quiz[]> {
    return this.quizzesService.findQuizzesByUser(userId);
  }

  @Put('')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Body('quiz') quiz: string,
    @Body('style') style: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Quiz> {
    return this.quizzesService.update(JSON.parse(quiz), JSON.parse(style), file);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.quizzesService.delete(id);
  }

  // ─── QUESTIONS ────────────────────────────────────────────────────────────────

  @Post('questions')
  @UseInterceptors(FileInterceptor('file'))
  async createQuizQuestions(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.quizzesService.createQuestions(file, req.user.userId);
  }

  @Public()
  @Get(':accessIdentifier/questions')
  async findQuestionsByQuiz(
    @Param('accessIdentifier') accessIdentifier: string,
  ): Promise<{ questions: Question[]; images: string[] | null; audios: string[] | null }> {
    return this.quizzesService.getQuestionsByQuiz(accessIdentifier);
  }

  // ─── RESPONSES ────────────────────────────────────────────────────────────────

  @Public()
  @Post('responses')
  async createResponse(@Body() createResponseDto: CreateResponseDto) {
    return this.responseService.addResponse(createResponseDto);
  }

  @Get('responses/listByUser/:userId')
  async findByUser(@Param('userId') userId: string): Promise<ResponseWithQuiz[]> {
    return this.responseService.getResponsesByUser(userId);
  }

  @Public()
  @Put('responses')
  async updateResponse(@Body() updateResponseDto: UpdateResponseDto) {
    return this.responseService.updateResponse(updateResponseDto);
  }

  @Delete('/:quizId/responses')
  async deleteByNickname(
    @Param('quizId') quizId: string,
    @Query('nickname') nickname: string,
  ) {
    return this.responseService.deleteResponsesByNickname(quizId, nickname);
  }

  // ─── ANSWERS ──────────────────────────────────────────────────────────────────

  @Get('answers/listByQuestion/:questionId')
  async listByQuestion(
    @Param('questionId') questionId: string,
    @Query('quizId') quizId: string,
  ) {
    return this.responseService.getAnswersByQuestion(quizId, questionId);
  }

  // ─── CORRECT QUIZ ─────────────────────────────────────────────────────────────

  @Public()
  @Post('correct-quiz/:responseId')
  async correctQuiz(
    @Param('responseId') responseId: string,
    @Body()
    body: {
      questions: QuestionDocument[];
      answers: string[];
      times: number[];
      scores: number[];
    },
  ): Promise<number> {
    return this.responseService.correctQuiz(
      responseId,
      body.questions,
      body.answers,
      body.times,
      body.scores,
    );
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────────

  @Public()
  @Get(':quizId/summary')
  async getSummaryByQuiz(@Param('quizId') quizId: string): Promise<QuestionSummary[]> {
    return this.responseService.getSummaryByQuiz(quizId);
  }
}