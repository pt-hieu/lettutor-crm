import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/user.entity'

@Module({
  imports: [
    MailerModule.forRoot({
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
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }