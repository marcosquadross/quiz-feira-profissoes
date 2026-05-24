import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(
  {
    cors: {
      origin: "*",
      methods: ["GET"],
      credentials: true
    }
  },
)

export class EventsGateway implements OnModuleInit {
  @WebSocketServer() server: Server;
  private responses: Response[] = [];

  onModuleInit() {
    this.server.on('connection', (socket) => {
      socket.emit('connection', 'Successfully connected to the server', this.responses);
    });
  }

  @SubscribeMessage('newResponse')
  handleNewMessage(@MessageBody() body:any) {
    this.server.emit('newResponse', body);
  }

  @SubscribeMessage('newQuiz')
  handleNewQuiz(@MessageBody() body: any) {
    this.server.emit('newQuiz', body);
  }
} 