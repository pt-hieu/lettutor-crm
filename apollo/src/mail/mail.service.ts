import { User } from 'src/user/user.entity'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  sendResetPwdMail(target: User, token: string) {
    const link = process.env.FE_URL + '/reset-password?token=' + token

    return this.mailerService.sendMail({
      to: target.email,
      subject: 'CRM - Password Reset',
      html: 'Click the following link to reset your password: ' + link,
    })
  }

  sendAddPwdMail(from: string, target: User, token: string) {
    const link = process.env.FE_URL + '/add-password?token=' + token

    return this.mailerService.sendMail({
      to: target.email,
      subject: 'CRM - Add New Password',
      html:
        from +
        ' invite you to join CRM account, please click the following link to complete your participation: ' +
        link,
    })
  }
}