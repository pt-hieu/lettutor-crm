import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Response } from 'express'
import { Repository } from 'typeorm'

import { AuthService } from 'src/auth/auth.service'
import { Role } from 'src/role/role.entity'
import { DTO } from 'src/type'
import { User, UserStatus } from 'src/user/user.entity'

import { role, user } from './data'
import { MockType, repositoryMockFactory } from './utils'

describe('auth service', () => {
  let usersRepo: MockType<Repository<User>>
  let authService: AuthService
  const res = {} as Response
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
        roles: [
          {
            actions: role.actions,
            id: role.id,
            name: role.name,
          },
        ],
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

    it('log in with an inactive account', () => {
      const dto: DTO.Auth.Login = {
        email: user.email,
        password: user.password,
      }

      let inactiveUser = user
      inactiveUser.status = UserStatus.INACTIVE

      usersRepo.findOne.mockReturnValue(inactiveUser)
      expect(authService.validate(dto, res)).rejects.toThrow(
        new BadRequestException('Inactive Account'),
      )
    })
  })
})
