import { User } from '@/user/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { compare, hash } from 'bcrypt'
import { DTO } from '@/type'



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  async signup(dto: DTO.Auth.SignUp) {
    if (await this.checkExistence(dto.email))
      throw new BadRequestException('User already exists')

    await this.userRepo.save({
      ...dto,
      password: await hash(dto.password, 10),
    })
  }

  async validate(dto: DTO.Auth.Login) {
    const user = await this.userRepo.findOne({ email: dto.email })

    if (!user) throw new BadRequestException('Email or password is wrong')
    if (!(await compare(dto.password, user.password)))
      throw new BadRequestException('Email or password is wrong')

    return user
  }

  async checkExistence(email: string) {
    const user = await this.userRepo.findOne({ email })

    return !!user
  }
}
