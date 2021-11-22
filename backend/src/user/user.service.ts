import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { randomBytes } from 'crypto'
import { DTO } from 'src/type'
import moment from 'moment'
import { MailService } from 'src/mail/mail.service'
import { compare, hash } from 'bcrypt'
import { JwtPayload } from 'src/utils/interface'
import { SimpleUser } from './user.interface'

import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate'
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

  async changePwd(dto: DTO.User.ChangePwd, payload: JwtPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.id } })
    if (!user) throw new BadRequestException('User does not exist')

    if (!(await compare(dto.oldPassword, user.password))) {
      throw new BadRequestException('Old password is wrong')
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must differ from old password',
      )
    }

    user.password = await hash(dto.newPassword, 10)
    return this.userRepo.save(user)
  }

  async listUsers(
    options: IPaginationOptions,
  ): Promise<Pagination<SimpleUser>> {
    const result = await paginate<User>(this.userRepo, options)
    const items = result.items.map((user) => this.buildSimpleUser(user))
    return {
      items,
      meta: result.meta,
    }
  }

  async listUsersAndFilter(
    options: IPaginationOptions,
    type: string,
  ): Promise<Pagination<User>> {
    const [users, totalUsers] = await this.userRepo.findAndCount({
      skip: (Number(options.page) - 1) * Number(options.limit) || 0,
      take: Number(options.limit) || 10,
      select: ['id', 'name', 'email', 'role', 'type'],
      where: [{ type: type }],
    })
    const usersPageable: Pagination<User> = {
      items: users,
      meta: {
        currentPage: Number(options.page),
        itemCount: users.length,
        itemsPerPage: Number(options.limit),
        totalItems: totalUsers,
        totalPages: Math.ceil(users.length / Number(options.limit)),
      },
    }
    return usersPageable
  }

  private buildSimpleUser(user: User): SimpleUser {
    const simpleUser: SimpleUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      type: user.type,
    }

    return simpleUser
  }
}
