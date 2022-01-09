import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, FindOneOptions, Not, Repository } from 'typeorm'
import { Role, User, UserStatus } from './user.entity'
import { randomBytes } from 'crypto'
import { DTO } from 'src/type'
import moment from 'moment'
import { MailService } from 'src/mail/mail.service'
import { compare, hash } from 'bcrypt'
import { JwtPayload } from 'src/utils/interface'
import { paginate } from 'nestjs-typeorm-paginate'
import { EventEmitter2 } from '@nestjs/event-emitter'

const PWD_TOKEN_EXPIRATION = 5 //in days

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private mailService: MailService,
    private eventEmitter: EventEmitter2,
  ) {}

  getManyRole(dto: DTO.Role.GetManyRole) {
    const qb = this.roleRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.children', 'children')
      .loadRelationCountAndMap('r.usersCount', 'r.users')

    if (dto.shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit: dto.limit, page: dto.page })
  }

  async createRole(dto: DTO.Role.CreateRole) {
    const role = await this.roleRepo.findOne({ where: { name: dto.name } })
    if (role) throw new BadRequestException('Role existed')

    return this.roleRepo.save({
      name: dto.name,
      childrenIds: dto.childrenIds,
      actions: dto.actions,
    })
  }

  async updateRole(id: string, dto: DTO.Role.UpdateRole) {
    const role = await this.roleRepo.findOne(id)
    if (!role) throw new BadRequestException('Role does not exist')

    if (
      dto.name &&
      (await this.roleRepo.findOne({ where: { name: dto.name, id: Not(id) } }))
    )
      throw new BadRequestException('Name has been taken')

    this.eventEmitter.emit('auth.invalidate', id)

    return this.roleRepo.save({
      ...role,
      ...dto,
    })
  }

  async removeRole(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } })
    if (!role) throw new BadRequestException('Role does not exist')

    return this.roleRepo.remove(role)
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

    if (role) {
      q = q.leftJoinAndSelect('u.roles', 'roles', 'roles.name=:role', { role })
    } else {
      q = q.leftJoinAndSelect('u.roles', 'roles')
    }

    if (status) q = q.where('u.status = :status', { status })

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

  async updateUser(dto: DTO.User.UpdateUser, payload: JwtPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.id } })
    if (!user) throw new BadRequestException('User does not exist')

    user.name = dto.name
    return this.userRepo.save(user)
  }
}
