import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import 'dotenv/config.js'

import { AppModule } from 'src/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || 'api')
  app.enableCors({
    credentials: true,
    origin: [process.env.FE_URL]
  })

  await app.listen(4000)
}

bootstrap()
