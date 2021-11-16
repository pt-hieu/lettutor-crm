import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { randomBytes } from 'crypto'
import { DTO } from 'src/type'
import moment from 'moment'
import { MailService } from 'src/mail/mail.service'
import { compare, hash } from 'bcrypt'

const RESET_PWD_TOKEN_EXPIRATION = 5 //in days

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async requestResetPwdEmail(dto: DTO.User.RequestResetPwd) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } })
    if (!user) throw new BadRequestException('User does not exist')

    const token = randomBytes(48).toString('base64url')

    return this.mailService.sendResetPwdMail(user, token).then(async () => {
      user.resetPasswordToken = token
      user.tokenExpiration = moment()
        .add(RESET_PWD_TOKEN_EXPIRATION, 'days')
        .toDate()

      await this.userRepo.save(user)
      return true
    })
  }

  async findByResetPwdToken(dto: DTO.User.FindByTokenQuery) {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: dto.token },
    })

    if (!user) throw new BadRequestException('Token does not exist')

    return true
  }

  async resetPwd(dto: DTO.User.ResetPwd) {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: dto.token },
    })

    if (!user) throw new BadRequestException('User does not exist')
    if (moment().isSameOrAfter(user.tokenExpiration)) {
      throw new BadRequestException('Token has expired')
    }

    user.password = await hash(dto.password, 10)
    user.resetPasswordToken = null
    user.tokenExpiration = null

    return this.userRepo.save(user)
  }

  async changePwd(dto: DTO.User.ChangePwd, user: User) {
    if (!(await compare(dto.oldPassword, user.password))) {
      throw new BadRequestException('Old password is wrong')
    }

    if (await compare(dto.newPassword, user.password)) {
      throw new BadRequestException(
        'New password must differ from old password',
      )
    }

    if (dto.newPassword != dto.confirmPassword) {
      throw new BadRequestException('Confirm password not match')
    }

    user.password = await hash(dto.newPassword, 10)

    return this.userRepo.save(user)
  }
}
