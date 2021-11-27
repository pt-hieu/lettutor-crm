import { Role, User } from 'src/user/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { compare, hash } from 'bcrypt'
import { DTO } from 'src/type'
import { Response } from 'express'
import { JwtPayload } from 'src/utils/interface'
import jwt from 'jsonwebtoken'
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async signup(dto: DTO.Auth.SignUp) {
    if (await this.checkExistence(dto.email))
      throw new BadRequestException('User already exists')

    await this.userRepo.save({
      ...dto,
      password: await hash(dto.password, 10),
      role: [Role.SUPER_ADMIN],
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
      role: user.role,
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
