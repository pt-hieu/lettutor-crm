import 'dotenv/config.js'
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser'
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())
  app.enableCors({
    credentials: true,
    origin: [process.env.FE_URL]
  })

  await app.listen(8000);
}

bootstrap();
