import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AuthService } from 'src/auth/auth.service'
import { User } from 'src/user/user.entity'
import { Repository } from 'typeorm'
import { MockType, repositoryMockFactory } from './utils'
import { user } from './data'
import { DTO } from 'src/type'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'

describe('auth service', () => {
  let usersRepo: MockType<Repository<User>>
  let authService: AuthService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    usersRepo = ref.get(getRepositoryToken(User))
    authService = ref.get(AuthService)
  })

  describe('validate credentials', () => {
    it('login with a valid username and password', () => {
      const dto: DTO.Auth.Login = {
        email: user.email,
        password: user.password,
      }

      usersRepo.findOne.mockReturnValue(user)

      expect(authService.validate(dto)).toEqual(Promise.resolve(user))
    })

    it('log in with an incorrect email', () => {
      const dto: DTO.Auth.Login = {
        email: 'user@gmail.com',
        password: user.password,
      }

      usersRepo.findOne.mockReturnValue(user)

      expect(authService.validate(dto)).rejects.toThrow(
        new BadRequestException('Email or password is wrong'),
      )
    })

    it('log in with an incorrect password', () => {
      const dto: DTO.Auth.Login = {
        email: user.email,
        password: 'abcxyz',
      }

      usersRepo.findOne.mockReturnValue(user)

      expect(authService.validate(dto)).rejects.toThrow(
        new BadRequestException('Email or password is wrong'),
      )
    })
  })
})
