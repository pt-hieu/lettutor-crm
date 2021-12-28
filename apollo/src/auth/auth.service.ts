import { User, Role } from 'src/user/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { compare, hash } from 'bcrypt'
import { DTO } from 'src/type'
import { Response } from 'express'
import { JwtPayload } from 'src/utils/interface'
import jwt from 'jsonwebtoken'
import { Actions } from 'src/type/action'

const ADMINISTRATIVE_ROLE_NAME = 'Admin'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async signup(dto: DTO.Auth.SignUp) {
    if (await this.checkExistence(dto.email))
      throw new BadRequestException('User already exists')

    let role: Role
    role = await this.roleRepo.findOne({
      where: { name: ADMINISTRATIVE_ROLE_NAME },
    })

    if (!role) {
      role = await this.roleRepo.save({
        name: ADMINISTRATIVE_ROLE_NAME,
        actions: [Actions.IS_ADMIN],
      })
    }

    await this.userRepo.save({
      ...dto,
      password: await hash(dto.password, 10),
      roles: [role],
    })
  }

  async validate(dto: DTO.Auth.Login, res: Response) {
    const user = await this.userRepo.findOne({ email: dto.email })

    if (!user) throw new BadRequestException('Email or password is wrong')

    if (!(await compare(dto.password, user.password)))
      throw new BadRequestException('Email or password is wrong')

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      name: user.name,
      roles: user.roles,
    }

    if (process.env.NODE_ENV !== 'production') {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d',
      })

      res.set('X-Access-Token', token)
    }

    return payload
  }

  async checkExistence(email: string) {
    const user = await this.userRepo.findOne({ email })

    return !!user
  }
}
