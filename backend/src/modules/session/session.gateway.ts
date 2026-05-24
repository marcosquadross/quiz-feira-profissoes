import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionService } from './session.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'session'
})
export class SessionGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // IMPORTANTE: Injetar o serviço no construtor
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService

  ) { }
  private get redisClient() {
    return this.sessionService.redis;
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    if (token) {
      try {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        console.log(`Payload do JWT:`, payload);

        client.data.user = {
          userId: payload.sub || payload.userId,
          nickname: payload.nickname || payload.name, 
          isHost: true
        };

      } catch (e) {
        return client.disconnect();
      }
    } else {
      client.data.user = {
        userId: `guest_${client.id}`,
        nickname: 'Visitante',
        isHost: false
      };
    }

    console.log(`Conectado: ${client.data.user.userId}`);
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string; nickname: string; playerId?: string }
  ) {
    const { sessionAccessId, nickname, playerId } = data;
    const userIdFromAuth = client.data.user.userId;
    const finalNickname = nickname || client.data.user.nickname;

    const realHostId = await this.sessionService.getHostId(sessionAccessId);
    const isHost = realHostId === userIdFromAuth;
    const style = await this.sessionService.getSessionStyle(sessionAccessId);
    const currentPlayers = await this.sessionService.getPlayersStatus(sessionAccessId);

    client.join(sessionAccessId);

    if (isHost) {
      client.join(`${sessionAccessId}_host`);
      return {
        status: 'ok',
        role: 'host',
        userId: userIdFromAuth,
        players: currentPlayers,
        style
      };
    }

    const playerResult = await this.sessionService.findOrCreatePlayer(
      sessionAccessId,
      { 
        nickname: finalNickname, 
        playerId,
        userId: userIdFromAuth || undefined
      }
    );

    client.data.user.userId = playerResult.id.toString();
    client.data.user.nickname = playerResult.nickname;

    if (playerResult.isNew && playerResult.isGenuinelyNew) {
      const status = await this.sessionService.getSessionStatus(sessionAccessId);

      if (status === 'waiting') {
        await this.sessionService.addPlayerToSession(sessionAccessId, {
          nickname: playerResult.nickname,
          playerId: playerResult.id.toString()
        });

        this.server.to(`${sessionAccessId}_host`).emit('player_joined', {
          userId: playerResult.id.toString(),
          nickname: playerResult.nickname
        });

        const allPlayers = await this.sessionService.getPlayersStatus(sessionAccessId);
        this.server.to(sessionAccessId).emit('players_list_updated', allPlayers);
        client.emit('players_list_updated', allPlayers);
      }
    }

    return {
      status: 'ok',
      role: 'player',
      userId: playerResult.id.toString(),
      style,
      players: await this.sessionService.getPlayersStatus(sessionAccessId)
    };
  }

  @SubscribeMessage('start_session')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string }
  ) {
    const { sessionAccessId } = data;

    const isHost = client.rooms.has(`${sessionAccessId}_host`);
    if (!isHost) return { error: 'Apenas o host pode iniciar o quiz' };

    try {
      const result = await this.sessionService.nextQuestion(sessionAccessId);

      await this.redisClient.hSet(`session:${sessionAccessId}`, 'status', 'started');

      if (result.finished) return { error: 'Quiz não possui perguntas' };

      const config = await this.sessionService.getSessionConfig(sessionAccessId);

      const durationInSeconds = result.question.time || 30;
      let endTime = null;

      if (config.autoRelease) {
        endTime = Date.now() + (durationInSeconds * 1000);
        await this.sessionService.updateSessionTime(sessionAccessId, endTime);
      }

      this.server.to(sessionAccessId).emit('session_started', {
        question: {
          text: result.question.text,
          options: [
            result.question.answer1, result.question.answer2,
            result.question.answer3, result.question.answer4,
            result.question.answer5, result.question.answer6,
          ].filter(Boolean),
          time: endTime,
          maxScore: result.question.questionValue,
          index: 1,
          duration: durationInSeconds,
        },
        totalQuestions: config.totalQuestions || 0,
      });

      const cleanStatus = await this.sessionService.getPlayersStatus(sessionAccessId);
      this.server.to(`${sessionAccessId}_host`).emit('playersStatus', cleanStatus);

      return { status: 'started', autoReleased: config.autoRelease };
    } catch (error) {
      console.error("Erro ao iniciar sessão:", error);
      return { error: 'Erro ao iniciar sessão' };
    }
  }

  @SubscribeMessage('next_question')
  async handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string }
  ) {
    const { sessionAccessId } = data;

    const isHost = client.rooms.has(`${sessionAccessId}_host`);
    if (!isHost) return { error: 'Unauthorized' };

    try {
      const nextData = await this.sessionService.nextQuestion(sessionAccessId);

      if (nextData.finished) {
        return this.handleEndSession(client, { sessionAccessId });
      }

      const config = await this.sessionService.getSessionConfig(sessionAccessId);

      const duration = nextData.question.time || 30;
      let endTime = null;

      if (config.autoRelease) {
        endTime = Date.now() + (duration * 1000);
        await this.sessionService.updateSessionTime(sessionAccessId, endTime);
      }

      this.server.to(sessionAccessId).emit('new_question', {
        question: {
          text: nextData.question.text,
          image: nextData.question.image,
          options: [
            nextData.question.answer1, nextData.question.answer2,
            nextData.question.answer3, nextData.question.answer4,
            nextData.question.answer5, nextData.question.answer6,
          ].filter(Boolean),
          time: endTime,
          duration: duration,
          maxScore: nextData.question.questionValue,
          index: nextData.index + 1
        }
      });

      const cleanStatus = await this.sessionService.getPlayersStatus(sessionAccessId);
      this.server.to(`${sessionAccessId}_host`).emit('playersStatus', cleanStatus);

      return { status: 'next_sent' };
    } catch (error) {
      console.error("Erro ao passar questão:", error);
      return { error: 'Internal error' };
    }
  }
  @SubscribeMessage('update_session_settings')
  async handleUpdateSettings(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string, autoRelease: boolean }
  ) {
    const { sessionAccessId, autoRelease } = data;
    const isHost = client.rooms.has(`${sessionAccessId}_host`);
    if (!isHost) return { error: 'Unauthorized' };

    try {
      const result = await this.sessionService.updateAutoReleaseAndCheck(sessionAccessId, autoRelease);

      if (result.shouldRelease) {
        this.server.to(sessionAccessId).emit('question_released', {
          endTime: result.endTime
        });
      }

      return { status: 'updated' };
    } catch (error) {
      console.error("Erro ao atualizar settings:", error);
      return { error: 'Internal error' };
    }
  }

  @SubscribeMessage('getPlayersStatus')
  async handleGetStatus(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionAccessId: string }) {
    const status = await this.sessionService.getPlayersStatus(data.sessionAccessId);
    client.emit('playersStatus', status);
  }

  @SubscribeMessage('send_answer')
  async handleSendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string; selectedOption: string; timeSpent: number }
  ) {
    const { userId, nickname } = client.data.user;
    try {
      const result = await this.sessionService.submitAnswer(
        data.sessionAccessId,
        userId,
        nickname,
        data
      );

      const playersStatus = await this.sessionService.getPlayersStatus(data.sessionAccessId);

      this.server.to(`${data.sessionAccessId}_host`).emit('playersStatus', playersStatus);

      this.server.to(`${data.sessionAccessId}_host`).emit('player_answered', {
        userId,
        nickname
      });
      return { status: 'success', isCorrect: result.isCorrect };

    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      return { status: 'error', message: 'Falha ao processar resposta' };
    }
  }

  @SubscribeMessage('end_session')
  async handleEndSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string }
  ) {
    const { sessionAccessId } = data;

    const isHost = client.rooms.has(`${sessionAccessId}_host`);
    if (!isHost) return { error: 'Unauthorized' };

    try {
      await this.sessionService.persistAnswersToMongo(sessionAccessId);

      const podium = await this.sessionService.finalizeSessionData(sessionAccessId);
      const style = await this.sessionService.getSessionStyle(sessionAccessId);

      this.server.to(sessionAccessId).emit('session_finished', {
        msg: 'O Quiz terminou!',
        podium,
        style, 
      });

      await this.sessionService.closeRedisSession(sessionAccessId);

      this.server.in(sessionAccessId).socketsLeave(sessionAccessId);

      return { status: 'session_closed' };
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      return { error: 'Erro ao encerrar sessão' };
    }
  }

  @SubscribeMessage('pause_session')
  async handlePause(client: Socket, data: { sessionAccessId: string }) {
    const { sessionAccessId } = data;

    this.server.to(sessionAccessId).emit('session_paused');
    return { status: 'paused' };
  }

  @SubscribeMessage('time_up')
  async handleTimeUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string }
  ) {
    const { sessionAccessId } = data;

    const isHost = client.rooms.has(`${sessionAccessId}_host`);
    if (!isHost) return;

    try {
      const config = await this.sessionService.getSessionConfig(sessionAccessId);

      if (config.autoRelease) {
        setTimeout(async () => {
          await this.handleNextQuestion(client, { sessionAccessId });
        }, 2000);
      } else {
        this.server.to(sessionAccessId).emit('time_expired');
      }
    } catch (error) {
      console.error("Erro no processamento de tempo esgotado:", error);
    }
  }

  @SubscribeMessage('resume_session')
  async handleResume(client: Socket, data: { sessionAccessId: string, remainingTime: number }) {
    const { sessionAccessId, remainingTime } = data;

    const newEndTime = Date.now() + (remainingTime * 1000);

    await this.sessionService.updateSessionTime(sessionAccessId, newEndTime);

    this.server.to(sessionAccessId).emit('session_resumed', {
      endTime: newEndTime
    });

    return { status: 'resumed' };
  }

  @SubscribeMessage('release_question')
  async handleRelease(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string }
  ) {
    const { sessionAccessId } = data;
    const isHost = client.rooms.has(`${sessionAccessId}_host`);
    if (!isHost) return { error: 'Unauthorized' };

    try {
      const currentData = await this.sessionService.getCurrentQuestion(sessionAccessId);
      if (!currentData) return { error: 'Questão não encontrada' };

      const duration = currentData.question.time || 30;
      const endTime = Date.now() + (duration * 1000);

      await this.sessionService.updateSessionTime(sessionAccessId, endTime);

      this.server.to(sessionAccessId).emit('question_released', {
        endTime: endTime
      });

      return { status: 'released' };
    } catch (error) {
      return { error: 'Erro ao liberar questão' };
    }
  }

  @SubscribeMessage('get_current_state')
  async handleGetCurrentState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionAccessId: string; playerId?: string }
  ) {
    const { sessionAccessId, playerId } = data;

    client.join(sessionAccessId);

    const realHostId = await this.sessionService.getHostId(sessionAccessId);
    const userIdFromAuth = client.data.user.userId;
    const isHost = realHostId === userIdFromAuth;

    console.log(`Usuário ${client.data.user.nickname} (${userIdFromAuth}) entrou na sessão ${sessionAccessId} como ${isHost ? 'Host' : 'Player'}`);

    if (isHost) {
      client.join(`${sessionAccessId}_host`);
    } else if (playerId) {
      const playerResult = await this.sessionService.findOrCreatePlayer(
        sessionAccessId,
        { nickname: client.data.user.nickname, playerId }
      );
      client.data.user.userId = playerResult.id.toString();
      console.log(`Jogador ${client.data.user.nickname} autenticado com ID ${client.data.user.userId} para a sessão ${sessionAccessId}`);
    }

    const currentData = await this.sessionService.getCurrentQuestion(sessionAccessId);
    if (!currentData) {
      client.emit('current_state_data', { status: 'waiting' });
      return;
    }

    const config = await this.sessionService.getSessionConfig(sessionAccessId);
    const style = await this.sessionService.getSessionStyle(sessionAccessId);
    const key = `session:${sessionAccessId}`;

    const responseKey = `${key}:responses:${currentData.index}`;
    const playerResponse = playerId
      ? await this.redisClient.hGet(responseKey, client.data.user.userId)
      : null;
    const userStatus = playerResponse ? JSON.parse(playerResponse) : null;

    const sessionData = await this.redisClient.hGetAll(key);
    const savedEndTime = sessionData?.currentQuestionEndTime
      ? parseInt(sessionData.currentQuestionEndTime)
      : null;

    client.emit('current_state_data', {
      role: isHost ? 'host' : 'player',
      question: {
        ...currentData.question,
        index: currentData.index + 1,
        options: [
          currentData.question.answer1,
          currentData.question.answer2,
          currentData.question.answer3,
          currentData.question.answer4,
          currentData.question.answer5,
          currentData.question.answer6,
        ].filter(Boolean),
        duration: currentData.question.time,
        maxScore: currentData.question.questionValue,
      },
      totalQuestions: config.totalQuestions,
      autoRelease: config.autoRelease,
      isReleased: !!savedEndTime && savedEndTime > Date.now(),
      endTime: savedEndTime,
      isPaused: false,
      userStatus: userStatus
        ? { answered: true, selectedOption: userStatus.selectedOption }
        : { answered: false },
      style: style
    });
  }
}
