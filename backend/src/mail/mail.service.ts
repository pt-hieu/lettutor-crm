import { User } from 'src/user/user.entity'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  sendResetPwdMail(target: User, token: string) {
    const link = 'http://' + process.env.FE_URL + '/reset-password?token=' + token

    return this.mailerService.sendMail({
      to: target.email,
      subject: 'CRM - Password Reset',
      html: "Click the following link to reset your password: " + link
    })
  }
}
