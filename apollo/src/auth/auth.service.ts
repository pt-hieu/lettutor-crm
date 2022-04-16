import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { compare, hash } from 'bcryptjs'
import { Response } from 'express'
import { Repository } from 'typeorm'

import {
  Action,
  ActionType,
  DefaultActionTarget,
} from 'src/action/action.entity'
import { Role } from 'src/role/role.entity'
import { DTO } from 'src/type'
import { User, UserStatus } from 'src/user/user.entity'
import { JwtPayload } from 'src/utils/interface'

const ADMINISTRATIVE_ROLE_NAME = 'Admin'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Action) private actionRepo: Repository<Action>,
  ) {}

  async signup(dto: DTO.Auth.SignUp) {
    if (await this.checkExistence(dto.email))
      throw new BadRequestException('User already exists')

    let role: Role
    role = await this.roleRepo.findOne({
      where: { name: ADMINISTRATIVE_ROLE_NAME },
    })

    if (!role) {
      const action = await this.actionRepo.findOne({
        where: {
          target: DefaultActionTarget.ADMIN,
          type: ActionType.IS_ADMIN,
        },
      })

      role = await this.roleRepo.save({
        name: ADMINISTRATIVE_ROLE_NAME,
        actions: [action],
      })
    }

    await this.userRepo.save({
      ...dto,
      password: await hash(dto.password, 10),
      roles: [role],
    })
  }

  async validate(dto: DTO.Auth.Login, res: Response) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['roles', 'roles.actions'],
    })

    if (!user) throw new BadRequestException('Email or password is wrong')

    if (user.status != UserStatus.ACTIVE)
      throw new BadRequestException('Inactive Account')

    if (!(await compare(dto.password, user.password)))
      throw new BadRequestException('Email or password is wrong')

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      name: user.name,
      roles: user.roles.map((role) => ({
        name: role.name,
        actions: role.actions,
        id: role.id,
      })),
    }

    if (process.env.NODE_ENV !== 'production') {
      res.set('X-User', JSON.stringify(payload))
    }

    return payload
  }

  async checkExistence(email: string) {
    const user = await this.userRepo.findOne({ email })
    return !!user
  }
}
