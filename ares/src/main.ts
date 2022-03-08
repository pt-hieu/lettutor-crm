import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { config } from 'aws-sdk'
import { json, urlencoded } from 'body-parser'
import 'dotenv/config.js'
import morgan from 'morgan'
import { AppModule } from 'src/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(json({ limit: '22mb' }))
  app.use(urlencoded({ limit: '22mb', extended: true }))

  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
    const config = new DocumentBuilder()
      .setTitle('Ares')
      .addApiKey(
        { type: 'apiKey', name: 'x-api-key', in: 'header' },
        'x-api-key',
      )
      .setVersion('0.0.1')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)
  }

  await app.listen(9000)
}

bootstrap()
