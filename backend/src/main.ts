import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { config } from 'dotenv';
config();

/**
 * Função responsável por inicializar a aplicação.
*/

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors();
  app.enableCors({
    origin: [
      'http://172.16.255.204:8888', 
      'http://200.134.18.85:8888', 
      'http://localhost:5173', 
      'http://localhost:8888'
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });  
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.SERVER_PORT, '0.0.0.0');

}

bootstrap();