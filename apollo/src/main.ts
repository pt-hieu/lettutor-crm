import 'dotenv/config.js'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from 'src/app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { TransformInterceptor } from './transform.interceptor'
import morgan from 'morgan'
import { registerSchema } from 'class-validator'
import { ConvertToDealSchema } from './utils/ValidateSchema/ConvertToDeal.schema'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: process.env.NODE_ENV !== 'production',
    }),
  )
  app.useGlobalInterceptors(new TransformInterceptor())
  app.setGlobalPrefix(process.env.APOLLO_GLOBAL_PREFIX || 'api')
  app.use(cookieParser())
  app.enableCors({
    credentials: true,
    origin: [process.env.FE_URL],
  })

  registerSchema(ConvertToDealSchema)

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
    const config = new DocumentBuilder()
      .setTitle('Apollo')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'jwt',
      )
      .setVersion('0.0.1')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)
  }

  await app.listen(8000)
}

bootstrap()
