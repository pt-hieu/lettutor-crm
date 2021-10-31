import 'dotenv/config.js'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from '@/app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  app.setGlobalPrefix('api')
  app.use(cookieParser())
  app.enableCors({
    credentials: true,
    origin: [process.env.FE_URL],
  })

  await app.listen(8000)
}

bootstrap()
