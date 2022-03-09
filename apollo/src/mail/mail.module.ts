import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import path from 'path'

import { User } from 'src/user/user.entity'

import { MailService } from './mail.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT),
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: process.env.MAIL_FROM,
        },
        template: {
          dir: path.join(__dirname, '../templates/emails'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
            disableTemplateCache: process.env.NODE_ENV === 'development',
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
