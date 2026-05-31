import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Response, ResponseDocument } from './schemas/response.schema';
import { Quiz, QuizDocument } from '../quizzes/schemas/quiz.schema';
import { Answer } from './schemas/answer.schema';
import { Question, QuestionDocument } from '../quizzes/schemas/question.schema';

import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

import { EventsGateway } from '../shared/gateway/gateway';

import {
  ResponseWithQuiz,
  QuestionSummary,
  AnswerWithQuestion,
} from './response.interface';

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel(Response.name) private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    private readonly eventsGateway: EventsGateway,
  ) { }

  async addResponse(createResponseDto: CreateResponseDto): Promise<Response> {
    const quiz = await this.quizModel.findById(createResponseDto.quiz._id);
    if (!quiz) throw new BadRequestException('Quiz não encontrado');

    const response = new this.responseModel({
      quiz: new Types.ObjectId(createResponseDto.quiz._id),
      session: createResponseDto.session?._id
        ? new Types.ObjectId(createResponseDto.session._id)
        : null,
      nickname: createResponseDto.nickname,
      user: createResponseDto.user
        ? { _id: new Types.ObjectId(createResponseDto.user._id) }
        : undefined,
      answers: [],
    });

    return response.save();
  }

  async correctQuiz(
    responseId: string,
    questions: QuestionDocument[],
    answers: string[],
    times: number[],
    scores: number[],
  ): Promise<number> {
    const response = await this.responseModel.findById(responseId);
    if (!response) throw new BadRequestException('Response não encontrada');

    if (response.finalScore != null) {
      throw new BadRequestException('Quiz já foi corrigido para este jogador');
    }

    if (answers.length !== questions.length || times.length !== questions.length) {
      throw new BadRequestException(
        'Número de respostas ou tempos não corresponde ao número de questões',
      );
    }

    const correctAnswers = questions.map((q) => q.correctAnswer);
    let finalScore = 0;

    const builtAnswers: Answer[] = [];
    for (let i = 0; i < questions.length; i++) {
      const isCorrect = answers[i] === correctAnswers[i];
      const questionScore = isCorrect ? scores[i] ?? 0 : 0;
      finalScore += questionScore;

      builtAnswers.push({
        selectedOption:
          answers[i] && answers[i].trim() !== '' ? answers[i] : 'Não respondido',
        isCorrect,
        timeSpent: times[i] ?? 0,
        score: questionScore,
        question: questions[i]._id,
      });
    }

    response.answers = builtAnswers;
    response.finalScore = finalScore;
    await response.save();

    return finalScore;
  }

  async updateResponse(updateResponseDto: UpdateResponseDto): Promise<Response> {
    const response = await this.responseModel.findById(updateResponseDto._id);
    if (!response) throw new BadRequestException('Response não encontrada');

    response.finalScore = updateResponseDto.finalScore;
    response.finalTime = updateResponseDto.finalTime;

    await response.save();
    this.eventsGateway.handleNewMessage(response);

    return response;
  }

  // ✅ Tipo de retorno explícito — resolve ts(2883) e ts(7056)
  async getResponsesByUser(userId: string): Promise<ResponseWithQuiz[]> {
    const userObjectId = new Types.ObjectId(userId);

    const responses = await this.responseModel
      .find({ 'user._id': userObjectId })
      .populate('quiz', 'title accessIdentifier questions')
      .lean()
      .exec();

    return responses
      .filter((resp) => resp.quiz != null)
      .map((resp): ResponseWithQuiz => {
        const quiz = resp.quiz as any;

        return {
          quiz: {
            _id: quiz._id.toString(),
            title: quiz.title as string,
            accessIdentifier: quiz.accessIdentifier as string,
          },
          response: {
            _id: resp._id as Types.ObjectId,
            nickname: resp.nickname,
            finalScore: resp.finalScore,
            finalTime: resp.finalTime,
            createdAt: resp.createdAt,
            answers: resp.answers.map((a): AnswerWithQuestion => {
              const questionDoc = (quiz.questions as any[])?.find(
                (q) => q._id.toString() === a.question.toString(),
              );
              return {
                _id: a._id,
                selectedOption: a.selectedOption,
                isCorrect: a.isCorrect,
                timeSpent: a.timeSpent,
                score: a.score,
                question: questionDoc
                  ? {
                    _id: questionDoc._id,
                    text: questionDoc.text,
                    correctAnswer: questionDoc.correctAnswer,
                  }
                  : null,
              };
            }),
          },
        };
      });
  }

  async findAllResponses(): Promise<Record<string, any>[][]> {
    const responses = await this.responseModel
      .find({ finalScore: { $ne: null } })
      .populate('quiz', 'title accessIdentifier')
      .lean()
      .exec();

    const grouped = new Map<string, Record<string, any>[]>();
    for (const resp of responses) {
      const quiz = resp.quiz as any;
      const key = quiz._id.toString();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push({ ...resp, quiz });
    }

    return Array.from(grouped.values()).map((group) =>
      group.sort((a, b) => b.finalScore - a.finalScore),
    );
  }

  async getSummaryByQuiz(quizId: string): Promise<QuestionSummary[]> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new BadRequestException('Quiz não encontrado');

    const responses = await this.responseModel
      .find({ quiz: new Types.ObjectId(quizId), finalScore: { $ne: null } })
      .lean()
      .exec();

    const summaryMap = new Map<string, QuestionSummary>();

    quiz.questions.slice(0, quiz.selectedQuestions).forEach((q) => {
      summaryMap.set(q._id.toString(), {
        questionId: q._id.toString(),
        questionText: q.text,
        totalAnswers: 0,
        correctCount: 0,
        incorrectCount: 0,
        averageTime: 0,
        averageScore: 0,
      });
    });

    responses.forEach((resp) => {
      resp.answers.forEach((a) => {
        const s = summaryMap.get(a.question.toString());
        if (!s) return;
        s.totalAnswers += 1;
        s.correctCount += a.isCorrect ? 1 : 0;
        s.incorrectCount += a.isCorrect ? 0 : 1;
        s.averageTime += a.timeSpent;
        s.averageScore += a.score;
      });
    });

    summaryMap.forEach((s) => {
      if (s.totalAnswers > 0) {
        s.averageTime /= s.totalAnswers;
        s.averageScore /= s.totalAnswers;
      }
    });

    return Array.from(summaryMap.values());
  }

  async getAnswersByQuestion(quizId: string, questionId: string) {
    const responses = await this.responseModel
      .find({ quiz: new Types.ObjectId(quizId) })
      .lean()
      .exec();

    return responses.flatMap((resp) =>
      resp.answers
        .filter((a) => a.question && a.question.toString() === questionId)
        .map((a) => ({
          _id: a._id,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
          timeSpent: a.timeSpent,
          score: a.score,
          question: a.question.toString(),
          nickname: resp.nickname,
        })),
    );
  }

  async deleteResponsesByNickname(quizId: string, nickname: string): Promise<Response> {
    const response = await this.responseModel.findOneAndDelete({
      quiz: new Types.ObjectId(quizId),
      session: null,
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') },
    });

    if (!response) throw new BadRequestException('Response não encontrada');
    return response;
  }

  async deleteIncompleteResponsesByUser(userId: string): Promise<{ deleted: number }> {
    const result = await this.responseModel.deleteMany({
      'user._id': new Types.ObjectId(userId),
      finalScore: null,
    });
    return { deleted: result.deletedCount };
  }
}