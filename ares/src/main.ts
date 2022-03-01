import 'dotenv/config.js'
import { NestFactory } from '@nestjs/core'
import { config } from 'aws-sdk'
import { AppModule } from 'src/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  await app.listen(9000)
}

bootstrap()
