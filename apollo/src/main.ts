import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { json, urlencoded } from 'body-parser'
import { registerSchema } from 'class-validator'
import 'dotenv/config.js'
import morgan from 'morgan'
import { AppModule } from 'src/app.module'

import { TransformInterceptor } from './transform.interceptor'
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

  app.use(json({ limit: '22mb' }))
  app.use(urlencoded({ limit: '22mb', extended: true }))
  app.useGlobalInterceptors(new TransformInterceptor())
  registerSchema(ConvertToDealSchema)

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
    const config = new DocumentBuilder()
      .setTitle('Apollo')
      .addApiKey(
        { type: 'apiKey', name: 'x-api-key', in: 'header' },
        'x-api-key',
      )
      .addApiKey({ type: 'apiKey', name: 'x-user', in: 'header' }, 'x-user')
      .setVersion('0.0.1')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)
  }

  await app.listen(8000)
}

bootstrap()
