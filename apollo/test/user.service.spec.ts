import { BadRequestException } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import moment from 'moment'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

import { MailService } from 'src/mail/mail.service'
import { Role } from 'src/role/role.entity'
import { DTO } from 'src/type'
import { User, UserStatus } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { JwtPayload } from 'src/utils/interface'

import { role, user } from './data'
import { MockType, mockQueryBuilder, repositoryMockFactory } from './utils'

describe('user service', () => {
  let usersRepo: MockType<Repository<User>>
  let roleRepo: MockType<Repository<Role>>
  let userService: UserService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        UserService,
        {
          provide: MailService,
          useValue: {
            sendResetPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
            sendAddPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
          },
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    usersRepo = ref.get(getRepositoryToken(User))
    roleRepo = ref.get(getRepositoryToken(Role))
    userService = ref.get(UserService)
  })

  describe('request reset pwd email', () => {
    it('should send email succeed', async () => {
      const dto: DTO.User.RequestResetPwd = {
        email: user.email,
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      usersRepo.save.mockReturnValue({ ...user })

      expect(await userService.requestResetPwdEmail(dto)).toEqual(true)
    })

    it('should throw error when user does not exist', () => {
      const dto: DTO.User.RequestResetPwd = {
        email: user.email,
      }

      usersRepo.findOne.mockReturnValue(undefined)

      expect(userService.requestResetPwdEmail(dto)).rejects.toThrow(
        new BadRequestException('User does not exist'),
      )
    })
  })

  describe('find user by reset pwd token', () => {
    it('should find succeed', async () => {
      const dto: DTO.User.FindByTokenQuery = {
        token: user.passwordToken,
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      expect(await userService.findByResetPwdToken(dto)).toEqual(true)
    })

    it('should throw error when token does not exist', () => {
      const dto: DTO.User.FindByTokenQuery = {
        token: user.passwordToken,
      }

      usersRepo.findOne.mockReturnValue(undefined)
      expect(userService.findByResetPwdToken(dto)).rejects.toThrow(
        new BadRequestException('Token does not exist'),
      )
    })
  })

  describe('reset password', () => {
    it('should change pwd succeed', async () => {
      const dto: DTO.User.ResetPwd = {
        password: user.password,
        token: user.passwordToken,
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      usersRepo.save.mockReturnValue({ ...user })

      expect(await userService.resetPwd(dto)).toEqual(user)
    })

    it('should throw error when user does not exist', () => {
      const dto: DTO.User.ResetPwd = {
        password: user.password,
        token: user.passwordToken,
      }

      usersRepo.findOne.mockReturnValue(undefined)
      expect(userService.resetPwd(dto)).rejects.toThrow(
        new BadRequestException('User does not exist'),
      )
    })

    it('should throw error when token is expire', () => {
      const dto: DTO.User.ResetPwd = {
        password: user.password,
        token: user.passwordToken,
      }

      usersRepo.findOne.mockReturnValue({
        ...user,
        tokenExpiration: moment().subtract(1, 'day').toDate(),
      })

      expect(userService.resetPwd(dto)).rejects.toThrow(
        new BadRequestException('Token has expired'),
      )
    })
  })

  describe('change password', () => {
    it('should change pwd succeed', async () => {
      const dto: DTO.User.ChangePwd = {
        oldPassword: '123',
        newPassword: 'new@Password',
      }

      usersRepo.save.mockReturnValue({ ...user })
      usersRepo.findOne.mockReturnValue({ ...user })

      expect(await userService.changePwd(dto, user)).toEqual(user)
    })

    it('should throw error when old password not match current password', () => {
      const dto: DTO.User.ChangePwd = {
        oldPassword: 'Old@Password',
        newPassword: 'new@Password',
      }

      usersRepo.findOne.mockReturnValue({ ...user })

      expect(userService.changePwd(dto, user)).rejects.toThrow(
        new BadRequestException('Old password is wrong'),
      )
    })

    it('should throw error when new password match current password', () => {
      const dto: DTO.User.ChangePwd = {
        oldPassword: '123',
        newPassword: '123',
      }

      usersRepo.findOne.mockReturnValue({ ...user })

      expect(userService.changePwd(dto, user)).rejects.toThrow(
        new BadRequestException('New password must differ from old password'),
      )
    })
  })

  describe('get one user', () => {
    it('should return user successfully', async () => {
      const payload: JwtPayload = {
        email: user.email,
        id: user.id,
        name: user.name,
        roles: [],
      }

      usersRepo.findOne.mockReturnValue({
        name: user.name,
        email: user.email,
        status: user.status,
      })

      expect(await userService.getOne(payload)).toEqual({
        name: user.name,
        email: user.email,
        status: user.status,
      })
    })

    it('should throw error when user does not exist', () => {
      const payload: JwtPayload = {
        email: user.email,
        id: user.id,
        name: user.name,
        roles: [],
      }

      usersRepo.findOne.mockReturnValue(undefined)
      expect(userService.getOne(payload)).rejects.toThrow(
        new BadRequestException('User does not exist'),
      )
    })
  })

  describe('getMany', () => {
    it('should return users succeed', async () => {
      const dto: DTO.User.UserGetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([user])
      expect(
        ((await userService.getMany(dto)) as Pagination<User, IPaginationMeta>)
          .items,
      ).toEqual([user])
    })
  })

  describe('add user', () => {
    it('should add user succeed', async () => {
      const dto: DTO.User.AddUser = {
        name: user.name,
        email: user.email,
        roleId: '24',
      }

      usersRepo.findOne.mockReturnValue(null)
      roleRepo.findOne.mockReturnValue(role)
      usersRepo.save.mockReturnValue({ ...dto })

      expect(await userService.addUser(dto, user.name)).toEqual(true)
    })

    it('should throw error when user exist', () => {
      const dto: DTO.User.AddUser = {
        name: user.name,
        email: user.email,
        roleId: '24',
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      roleRepo.findOne.mockReturnValue(role)

      expect(userService.addUser(dto, user.name)).rejects.toThrow(
        new BadRequestException(
          'User you want to add is exist, cannot add new user',
        ),
      )
    })

    it('should throw error when role does not exist', () => {
      const dto: DTO.User.AddUser = {
        name: user.name,
        email: user.email,
        roleId: '24',
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      roleRepo.findOne.mockReturnValue(undefined)

      expect(userService.addUser(dto, user.name)).rejects.toThrow(
        new BadRequestException('Role does not exist'),
      )
    })
  })

  describe('update user', () => {
    it('should update user succeed', async () => {
      const dto: DTO.User.UpdateUser = {
        name: 'Admin',
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      usersRepo.save.mockReturnValue({ ...user, ...dto })

      expect(await userService.updateUser(dto, user)).toEqual({
        ...user,
        ...dto,
      })
    })

    it('should throw error when user does not exist', () => {
      const dto: DTO.User.UpdateUser = {
        name: 'Admin',
      }

      usersRepo.findOne.mockReturnValue(undefined)

      expect(userService.updateUser(dto, user)).rejects.toThrow(
        new BadRequestException('User does not exist'),
      )
    })
  })

  describe('activate user', () => {
    it('should activate-deactive user succeed', async () => {
      const dto: DTO.User.ActivateUser = {
        status: UserStatus.INACTIVE,
      }

      usersRepo.findOne.mockReturnValue({ ...user })
      usersRepo.save.mockReturnValue({ ...user, ...dto })

      expect(await userService.activateUser(user.id, dto)).toEqual({
        ...user,
        ...dto,
      })
    })

    it('should throw error when user does not exist', () => {
      const dto: DTO.User.ActivateUser = {
        status: UserStatus.INACTIVE,
      }

      usersRepo.findOne.mockReturnValue(undefined)

      expect(userService.activateUser(user.id, dto)).rejects.toThrow(
        new BadRequestException('User does not exist'),
      )
    })
  })
})
