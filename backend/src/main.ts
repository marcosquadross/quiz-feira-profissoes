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
    origin: process.env.FRONTEND_URL?.split(','),
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.SERVER_PORT, '0.0.0.0');

}

bootstrap();