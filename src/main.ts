import * as dotenv from 'dotenv';
dotenv.config({
  path: '/Users/mohamedibrahim/figma-project/config.env',
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(3000, () => console.log('The server is running'));
}
bootstrap();
