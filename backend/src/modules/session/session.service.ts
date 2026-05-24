import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createClient } from 'redis';

import { Session, SessionDocument } from './schemas/session.schema';
import { Quiz, QuizDocument } from '../quizzes/schemas/quiz.schema';
import { Response, ResponseDocument } from '../response/schemas/response.schema';

@Injectable()
export class SessionService implements OnModuleInit {
  private redisClient;

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
  ) {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
  }

  get redis() {
    return this.redisClient;
  }

  async onModuleInit() {
    await this.redisClient.connect();
  }

  // ─── SESSION CRUD ─────────────────────────────────────────────────────────────
  async create(data: any) {
    return this.sessionModel.create({
      ...data,
      quiz: new Types.ObjectId(String(data.quiz)),
      host: { _id: new Types.ObjectId(String(data.host._id)) }, // ✅ host
    });
  }

  async getSessionsByQuiz(quizId: string): Promise<Record<string, any>[]> {
    const sessions = await this.sessionModel
      .find({
        quiz: new Types.ObjectId(quizId),
        endAt: { $exists: true, $ne: null },
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const sessionIds = sessions.map((s) => s._id);
    const responses = await this.responseModel
      .find({ session: { $in: sessionIds } })
      .lean()
      .exec();

    return sessions.map((session) => ({
      ...session,
      responses: responses.filter(
        (r) => r.session?.toString() === session._id.toString(),
      ),
    }));
  }

  // ─── REDIS / LIVE SESSION ─────────────────────────────────────────────────────
  async createLiveSession(sessionAccessId: string) {
    const sessionDb = await this.sessionModel
      .findOne({ sessionAccessId })
      .populate('quiz');
    if (!sessionDb || !sessionDb.quiz) throw new Error('Sessão ou Quiz não encontrado');

    const quiz = sessionDb.quiz as any;
    const key = `session:${sessionAccessId}`;

    await this.redisClient.hSet(key, {
      status: 'waiting',
      currentQuestionIndex: '-1',
      quizId: quiz._id.toString(),
      questions: JSON.stringify(quiz.questions),
      autoRelease: quiz.autoRelease ? 'true' : 'false',
      totalQuestions: quiz.selectedQuestions,
    });
    await this.redisClient.expire(key, 86400);
  }

  async findOrCreatePlayer(
    sessionAccessId: string,
    data: { nickname: string; playerId?: string; userId?: string },
  ) {
    const key = `session:${sessionAccessId}:players`;

    if (data.playerId) {
      const exists = await this.redisClient.hExists(key, data.playerId);
      const playerValue = JSON.stringify({
        nickname: data.nickname,
        userId: data.userId || null,
      });

      if (!exists) {
        await this.redisClient.hSet(key, data.playerId, playerValue);
        return {
          id: data.playerId,
          nickname: data.nickname,
          userId: data.userId || null,
          isNew: false,
          isGenuinelyNew: false,
        };
      }

      return {
        id: data.playerId,
        nickname: data.nickname,
        userId: data.userId || null,
        isNew: false,
        isGenuinelyNew: false,
      };
    }

    const newId = new Types.ObjectId().toString();
    await this.redisClient.hSet(
      key,
      newId,
      JSON.stringify({ nickname: data.nickname, userId: data.userId || null }),
    );

    return {
      id: newId,
      nickname: data.nickname,
      userId: data.userId || null,
      isNew: true,
      isGenuinelyNew: true,
    };
  }

  // ─── PLAYER / RESPONSE ────────────────────────────────────────────────────────
  async addPlayerToSession(
    sessionAccessId: string,
    user: { nickname: string; playerId: string; userId?: string },
  ) {
    const session = await this.sessionModel.findOne({ sessionAccessId });
    if (!session) throw new Error('Sessão não encontrada');

    const existing = await this.responseModel.findOne({
      session: session._id,
      'user._id': new Types.ObjectId(user.playerId),
    });

    if (existing) {
      console.log(`[addPlayerToSession] DUPLICATA BLOQUEADA: ${user.nickname} já existe`);
      return;
    }

    console.log(`[addPlayerToSession] Inserindo ${user.nickname} pela primeira vez`);

    const quizId = new Types.ObjectId(session.quiz.toString());

    return this.responseModel.create({
      quiz: quizId,
      session: session._id,
      nickname: user.nickname,
      user: { _id: new Types.ObjectId(user.playerId) },
      answers: [],
      finalScore: 0,
      finalTime: 0,
    });
  }

  // ─── QUESTION FLOW ────────────────────────────────────────────────────────────
  async finishQuestion(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);
    const questions = JSON.parse(sessionData.questions);
    const totalQuestions = parseInt(sessionData.totalQuestions) || questions.length;
    const currentIdx = parseInt(sessionData.currentQuestionIndex);
    const isLastQuestion = currentIdx >= totalQuestions - 1;

    const session = await this.sessionModel.findOne({ sessionAccessId });
    if (!session) throw new Error('Sessão não encontrada');

    const responses = await this.responseModel
      .find({ session: session._id })
      .lean()
      .exec();

    const leaderboard = responses
      .map((r) => ({
        nickname: r.nickname,
        score: r.finalScore ?? 0,
        userId: r.user?._id,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return { leaderboard, isLastQuestion, currentIdx };
  }

  async nextQuestion(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);

    if (!sessionData.questions) throw new Error('Dados da sessão corrompidos no Redis');

    const questions = JSON.parse(sessionData.questions);
    const totalQuestions = parseInt(sessionData.totalQuestions) || questions.length;
    const nextIdx = parseInt(sessionData.currentQuestionIndex) + 1;

    if (nextIdx >= totalQuestions) {
      return { finished: true };
    }

    await this.redisClient.hSet(key, {
      currentQuestionIndex: nextIdx.toString(),
      lastQuestionStartedAt: Date.now().toString(),
      currentQuestionEndTime: '0',
    });

    return {
      finished: false,
      question: questions[nextIdx],
      index: nextIdx,
    };
  }

  async getCurrentQuestion(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);

    if (!sessionData || !sessionData.questions) return null;

    const questions = JSON.parse(sessionData.questions);
    const currentIndex = parseInt(sessionData.currentQuestionIndex);

    if (currentIndex < 0 || currentIndex >= questions.length) return null;

    return { question: questions[currentIndex], index: currentIndex };
  }

  // ─── ANSWER SUBMISSION ────────────────────────────────────────────────────────

  async submitAnswer(
    sessionAccessId: string,
    userId: string,
    nickname: string,
    data: any,
  ) {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);

    if (!sessionData) throw new Error('Sessão não encontrada');

    const questions = JSON.parse(sessionData.questions);
    const currentIdx = parseInt(sessionData.currentQuestionIndex);
    const currentQuestion = questions[currentIdx];

    const isCorrect = data.selectedOption === currentQuestion.correctAnswer;

    let points = 0;
    if (isCorrect) {
      const maxScore = currentQuestion.questionValue || 1000;
      const duration = currentQuestion.time || 30;
      const endTime = parseInt(sessionData.currentQuestionEndTime || '0');
      const startTime = endTime - duration * 1000;
      const now = Date.now();
      const realTimeSpent = Math.min((now - startTime) / 1000, duration);
      const timeRatio = realTimeSpent / duration;
      const scoreFactor = 0.6 + 0.4 * (1 - timeRatio);
      points = Math.floor(maxScore * scoreFactor);
    }

    const responseKey = `${key}:responses:${currentIdx}`;
    await this.redisClient.hSet(
      responseKey,
      userId,
      JSON.stringify({
        nickname,
        points,
        isCorrect,
        answeredAt: Date.now(),
        questionIndex: currentIdx,
        timeSpent: data.timeSpent || 0,
        selectedOption: data.selectedOption,
      }),
    );

    const leaderboardKey = `${key}:ranking`;
    await this.redisClient.zIncrBy(leaderboardKey, points, userId);

    return { isCorrect, points, currentIdx };
  }

  async getPlayersStatus(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;
    const allPlayers = await this.redisClient.hGetAll(`${key}:players`);

    if (!allPlayers || Object.keys(allPlayers).length === 0) return [];

    const sessionData = await this.redisClient.hGetAll(key);
    const currentIdx = sessionData?.currentQuestionIndex || '0';
    const responders = await this.redisClient.hGetAll(`${key}:responses:${currentIdx}`);

    return Object.entries(allPlayers).map(([userId, raw]) => {
      const playerData = JSON.parse(raw as string);
      return {
        id: userId,
        nickname: playerData.nickname,
        answered: !!(responders && responders[userId]),
      };
    });
  }

  // ─── PERSIST / FINALIZE ───────────────────────────────────────────────────────
  async persistAnswersToMongo(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;

    const session = await this.sessionModel.findOne({ sessionAccessId });
    if (!session) throw new Error('Sessão não encontrada');

    const sessionData = await this.redisClient.hGetAll(key);
    if (!sessionData?.questions) throw new Error('Dados da sessão não encontrados no Redis');

    const questions = JSON.parse(sessionData.questions);

    const responseDocs = await this.responseModel
      .find({ session: session._id })
      .exec();

    const responseByUser = new Map<string, ResponseDocument>();
    for (const doc of responseDocs) {
      const uid = doc.user?._id?.toString();
      if (uid) responseByUser.set(uid, doc);
    }

    const playerAnswersMap = new Map<string, any[]>();
    for (const [uid] of responseByUser) {
      playerAnswersMap.set(uid, []);
    }

    for (let i = 0; i < questions.length; i++) {
      const responseKey = `${key}:responses:${i}`;
      const redisResponses = await this.redisClient.hGetAll(responseKey);

      for (const [userId, raw] of Object.entries(redisResponses)) {
        if (!playerAnswersMap.has(userId)) continue;
        const parsed = JSON.parse(raw as string);
        playerAnswersMap.get(userId).push({
          question: new Types.ObjectId(questions[i]._id),
          isCorrect: parsed.isCorrect,
          score: parsed.points,
          timeSpent: parsed.timeSpent,
          selectedOption: parsed.selectedOption,
        });
      }
    }

    const bulkOps = [];
    for (const [userId, answers] of playerAnswersMap.entries()) {
      const totalScore = answers.reduce((acc, a) => acc + a.score, 0);
      const totalTime = answers.reduce((acc, a) => acc + a.timeSpent, 0);

      bulkOps.push({
        updateOne: {
          filter: {
            session: session._id,
            'user._id': new Types.ObjectId(userId),
          },
          update: {
            $set: { answers, finalScore: totalScore, finalTime: totalTime },
          },
        },
      });
    }

    if (bulkOps.length > 0) {
      await this.responseModel.bulkWrite(bulkOps);
    }

    console.log(
      `[persistAnswersToMongo] ${bulkOps.length} jogadores processados para sessão ${sessionAccessId}`,
    );
  }

  async finalizeSessionData(sessionAccessId: string) {
    const session = await this.sessionModel.findOne({ sessionAccessId });
    if (!session) return null;

    const responses = await this.responseModel
      .find({ session: session._id })
      .exec();

    const bulkOps = responses.map((resp) => {
      const totalTime = resp.answers.reduce((acc, a) => acc + a.timeSpent, 0);
      const totalScore = resp.answers.reduce((acc, a) => acc + a.score, 0);
      return {
        updateOne: {
          filter: { _id: resp._id },
          update: { $set: { finalScore: totalScore, finalTime: totalTime } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await this.responseModel.bulkWrite(bulkOps);
    }

    await this.sessionModel.findOneAndUpdate(
      { sessionAccessId },
      { endAt: new Date(), status: 'finished' },
    );

    const podium = responses
      .map((r) => ({
        nickname: r.nickname,
        score: r.answers.reduce((acc, a) => acc + a.score, 0),
        time: r.answers.reduce((acc, a) => acc + a.timeSpent, 0),
      }))
      .sort((a, b) => b.score - a.score || a.time - b.time)
      .slice(0, 3);

    return podium;
  }

  async closeRedisSession(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;

    await this.sessionModel.findOneAndUpdate(
      { sessionAccessId },
      { endAt: new Date(), status: 'finished' },
    );

    await this.redisClient.del(key);
    await this.redisClient.del(`${key}:players`);

    const answerKeys = await this.redisClient.keys(`${key}:answered:*`);
    if (answerKeys.length > 0) {
      await this.redisClient.del(answerKeys);
    }

    return { status: 'closed' };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  async getSessionStyle(sessionAccessId: string) {
    const session = await this.sessionModel
      .findOne({ sessionAccessId })
      .populate('quiz');
    const quiz = session?.quiz as any;
    return quiz?.style || null;
  }

  async getSessionStatus(sessionAccessId: string): Promise<string> {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);
    if (!sessionData || Object.keys(sessionData).length === 0) return 'finished';
    const idx = parseInt(sessionData?.currentQuestionIndex || '-1');
    return idx === -1 ? 'waiting' : 'started';
  }

  async getSessionConfig(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);
    return {
      autoRelease: sessionData.autoRelease === 'true',
      totalQuestions: parseInt(sessionData.totalQuestions) || 0,
    };
  }

  async updateSessionTime(sessionAccessId: string, endTime: number) {
    const key = `session:${sessionAccessId}`;
    await this.redisClient.hSet(key, 'currentQuestionEndTime', endTime.toString());
  }

  async updateAutoReleaseAndCheck(sessionAccessId: string, autoRelease: boolean) {
    const key = `session:${sessionAccessId}`;
    await this.redisClient.hSet(key, 'autoRelease', autoRelease.toString());

    if (autoRelease) {
      const sessionData = await this.redisClient.hGetAll(key);
      const questions = JSON.parse(sessionData.questions);
      const currentIdx = parseInt(sessionData.currentQuestionIndex);

      if (!sessionData.currentQuestionEndTime || sessionData.currentQuestionEndTime === '0') {
        const currentQuestion = questions[currentIdx];
        const endTime = Date.now() + currentQuestion.time * 1000;
        await this.redisClient.hSet(key, 'currentQuestionEndTime', endTime.toString());
        return { shouldRelease: true, endTime };
      }
    }

    return { shouldRelease: false };
  }

  async autoProcessQuestionEnd(sessionAccessId: string) {
    const key = `session:${sessionAccessId}`;
    const sessionData = await this.redisClient.hGetAll(key);
    const finishResult = await this.finishQuestion(sessionAccessId);
    const isAutoRelease = sessionData.autoRelease === 'true';

    return {
      leaderboard: finishResult.leaderboard,
      isLastQuestion: finishResult.isLastQuestion,
      shouldAutoAdvance: isAutoRelease && !finishResult.isLastQuestion,
    };
  }

  async getHostId(sessionAccessId: string): Promise<string | null> {
    const session = await this.sessionModel
      .findOne({ sessionAccessId })
      .select('host');
    return session?.host?._id?.toString() || null;
  }
}