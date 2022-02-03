
import 'dotenv/config.js'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from 'src/app.module'
import morgan from 'morgan'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || 'api')
  app.use(cookieParser())
  app.enableCors({
    credentials: true,
    origin: [process.env.FE_URL],
  })

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
  }

  await app.listen(4000)
}

bootstrap()
