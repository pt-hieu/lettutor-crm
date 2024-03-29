import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { compare, hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { isEqual } from 'lodash'
import moment from 'moment'
import { paginate } from 'nestjs-typeorm-paginate'
import { Brackets, FindOneOptions, In, Repository } from 'typeorm'

import {
  ActionType,
  DefaultActionTarget,
  Action as RoleAction,
} from 'src/action/action.entity'
import { MailService } from 'src/mail/mail.service'
import { Action, FactorType } from 'src/notification/notification.entity'
import { NotificationService } from 'src/notification/notification.service'
import { Role } from 'src/role/role.entity'
import { DTO } from 'src/type'
import { CustomLRU } from 'src/utils/custom-lru'
import { JwtPayload } from 'src/utils/interface'

import { User, UserStatus } from './user.entity'

const PWD_TOKEN_EXPIRATION = 5 //in days
const ADMINISTRATIVE_ROLE_NAME = 'Admin'
const SALE_ROLE_NAME = 'Sale'

@Injectable()
export class UserService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RoleAction) private actionRepo: Repository<RoleAction>,
    private mailService: MailService,
    private notiService: NotificationService,
  ) {}

  async onApplicationBootstrap() {
    await this.initDefaultUsers()
  }

  private async initDefaultUsers() {
    const adminUser = await this.userRepo.findOne({ where: { name: 'admin' } })
    if (adminUser) return

    const adminAction = await this.actionRepo.save({
      target: DefaultActionTarget.ADMIN,
      type: ActionType.IS_ADMIN,
    })

    const saleAction = await this.actionRepo.save({
      target: DefaultActionTarget.SALE,
      type: ActionType.IS_SALE,
    })

    await this.roleRepo.save({
      name: SALE_ROLE_NAME,
      default: true,
      actions: [saleAction],
    })

    const adminRole = await this.roleRepo.save({
      name: ADMINISTRATIVE_ROLE_NAME,
      default: true,
      actions: [adminAction],
    })

    return this.userRepo.save({
      email: 'admin@mail.com',
      name: 'admin',
      password: '$2a$10$IOuioWuAWvx44fUVVLOEY.BEG4wKSXCKUSdJlwco1Ou/lmXbWXVJW', // Admin@123
      status: UserStatus.ACTIVE,
      roles: [adminRole],
    })
  }

  async getOne(payload: JwtPayload) {
    const user = await this.userRepo.findOne({
      where: { id: payload.id },
    })

    if (!user) throw new BadRequestException('User does not exist')

    return user
  }

  async requestResetPwdEmail(dto: DTO.User.RequestResetPwd) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } })
    if (!user) throw new BadRequestException('User does not exist')

    const token = randomBytes(48).toString('base64url')

    return this.mailService.sendResetPwdMail(user, token).then(async () => {
      user.passwordToken = token
      user.tokenExpiration = moment().add(PWD_TOKEN_EXPIRATION, 'days').toDate()

      await this.userRepo.save(user)
      return true
    })
  }

  async findByResetPwdToken(dto: DTO.User.FindByTokenQuery) {
    const user = await this.userRepo.findOne({
      where: { passwordToken: dto.token },
    })

    if (!user) throw new BadRequestException('Token does not exist')

    return true
  }

  async getOneUserById(option: FindOneOptions<User>) {
    const user = await this.userRepo.findOne(option)

    if (!user) throw new NotFoundException('User does not exist')
    return user
  }

  async resetPwd(dto: DTO.User.ResetPwd) {
    const user = await this.userRepo.findOne({
      where: { passwordToken: dto.token },
    })

    if (!user) throw new BadRequestException('User does not exist')
    if (moment().isSameOrAfter(user.tokenExpiration)) {
      throw new BadRequestException('Token has expired')
    }

    user.password = await hash(dto.password, 10)
    user.status = UserStatus.ACTIVE
    user.passwordToken = null
    user.tokenExpiration = null
    CustomLRU.set(user.id, user.id)

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

  async addUser(dto: DTO.User.AddUser, fromUser: string) {
    let targetUser = await this.userRepo.findOne({
      where: { email: dto.email },
    })

    const role = await this.roleRepo.findOne(dto.roleId)

    if (!role) {
      throw new BadRequestException('Role does not exist')
    }

    if (targetUser)
      throw new BadRequestException(
        'User you want to add is exist, cannot add new user',
      )

    const token = randomBytes(48).toString('base64url')

    targetUser = await this.userRepo.save({
      name: dto.name,
      email: dto.email,
      passwordToken: token,
      tokenExpiration: moment().add(PWD_TOKEN_EXPIRATION, 'days').toDate(),
      status: UserStatus.UNCONFIRMED,
      roles: [role],
    })
    return this.mailService.sendAddPwdMail(fromUser, targetUser, token)
  }

  async invalidateAddUserToken(id: string, fromUser: string) {
    const user = await this.userRepo.findOne(id)

    if (!user) {
      throw new NotFoundException(
        `User you want to re-send invitation email wasn't invited yet.`,
      )
    }

    if (user.status !== UserStatus.UNCONFIRMED) {
      throw new BadRequestException(`User has been confirmed.`)
    }

    const newToken = randomBytes(48).toString('base64url')

    await this.userRepo.save({
      ...user,
      passwordToken: newToken,
      tokenExpiration: moment().add(PWD_TOKEN_EXPIRATION, 'days').toDate(),
    })

    return this.mailService.sendAddPwdMail(fromUser, user, newToken)
  }

  getManyRaw() {
    return this.userRepo.find({
      select: ['id', 'name', 'status'],
      loadEagerRelations: false,
    })
  }

  getMany({
    limit,
    page,
    role,
    search,
    shouldNotPaginate,
    status,
  }: DTO.User.UserGetManyQuery) {
    let q = this.userRepo
      .createQueryBuilder('u')
      .addSelect(['u.id', 'u.name', 'u.email', 'u.status'])
      .leftJoinAndSelect('u.roles', 'roles')
      .orderBy('u.createdAt', 'DESC')

    if (role) {
      q = q.where('roles.name=:role', { role })
    }

    if (status) q = q.andWhere('u.status = :status', { status })

    if (search) {
      q = q.andWhere(
        new Brackets((q) =>
          q
            .andWhere('u.name ILIKE :search', { search: `%${search}%` })
            .orWhere('u.email ILIKE :search', { search: `%${search}%` }),
        ),
      )
    }

    if (shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit, page })
  }

  async updateUser(
    dto: DTO.User.UpdateUser,
    payload: JwtPayload,
    userId: string,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    })

    if (!user) throw new BadRequestException('User does not exist')

    user.name = dto.name

    if (!dto.roleIds) return this.userRepo.save(user)

    const roles = await this.roleRepo.find({
      where: { id: In(dto.roleIds) },
    })

    if (
      !isEqual(
        dto.roleIds,
        user.roles.map((role) => role.id),
      )
    ) {
      await this.notiService.createChangeRoleNoti({
        action: Action.CHANGE_ROLE,
        factorIds: [payload.id],
        factorType: FactorType.USER,
        meta: {
          roles: dto.roleIds,
        },
        userId,
        targetId: undefined,
        targetType: undefined,
      })
    }

    user.roles = roles

    return this.userRepo.save(user)
  }

  async activateUser(id: string, dto: DTO.User.ActivateUser) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new BadRequestException('User does not exist')
    user.status = dto.status

    if (dto.status == UserStatus.ACTIVE) {
      CustomLRU.set(user.id, user.id)
    } else {
      CustomLRU.delete(user.id)
    }
    return this.userRepo.save(user)
  }

  async batchDelete(ids: string[]) {
    const users = await this.userRepo.find({ where: { id: In(ids) } })
    users.forEach((user) => {
      CustomLRU.delete(user.id)
    })
    return this.userRepo.remove(users)
  }
}
