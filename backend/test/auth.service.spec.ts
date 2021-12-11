import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AuthService } from 'src/auth/auth.service'
import { Role, User } from 'src/user/user.entity'
import { Repository } from 'typeorm'
import { MockType, repositoryMockFactory } from './utils'
import { role, user } from './data'
import { DTO } from 'src/type'
import { BadRequestException } from '@nestjs/common'
import { Response } from 'express'

describe('auth service', () => {
  let usersRepo: MockType<Repository<User>>
  let roleRepo: MockType<Repository<Role>>
  let authService: AuthService
  let res = {} as Response
  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()
    res.set = jest.fn().mockReturnValue(true)
    usersRepo = ref.get(getRepositoryToken(User))
    roleRepo = ref.get(getRepositoryToken(Role))
    authService = ref.get(AuthService)
  })

  describe('validate credentials', () => {
    it('login with a valid username and password', async () => {
      const dto: DTO.Auth.Login = {
        email: user.email,
        password: '123',
      }

      usersRepo.findOne.mockReturnValue(user)
      process.env.JWT_SECRET = 'asdasbzxcihqqwheacapsdnlkn'
      expect(await authService.validate(dto, res)).toEqual({
        email: user.email,
        id: user.id,
        name: user.name,
        roles: [role]
      })
    })

    it('log in with an incorrect email', () => {
      const dto: DTO.Auth.Login = {
        email: 'user@gmail.com',
        password: '123',
      }

      usersRepo.findOne.mockReturnValue(undefined)
      expect(authService.validate(dto, res)).rejects.toThrow(
        new BadRequestException('Email or password is wrong'),
      )
    })

    it('log in with an incorrect password', () => {
      const dto: DTO.Auth.Login = {
        email: user.email,
        password: 'abcxyz',
      }

      usersRepo.findOne.mockReturnValue(user)
      expect(authService.validate(dto, res)).rejects.toThrow(
        new BadRequestException('Email or password is wrong'),
      )
    })
  })
})
