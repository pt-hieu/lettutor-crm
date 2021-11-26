import { MailService } from 'src/mail/mail.service'
import { DTO } from 'src/type'
import { Role, User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { user } from './data'
import { MockType, repositoryMockFactory } from './utils'
import moment from 'moment'
import { BadRequestException } from '@nestjs/common'

describe('user service', () => {
  let usersRepo: MockType<Repository<User>>
  let userService: UserService
  let mailService: MailService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile()

    usersRepo = ref.get(getRepositoryToken(User))
    mailService = ref.get(MailService)
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

  describe('add password', () => {
    it('should add pwd succeed', async () => {
      const dto: DTO.User.AddUser = {
        name: user.name,
        email: user.email,
        role: Role.SUPER_ADMIN,
      }

      usersRepo.findOne
        .mockReturnValueOnce({ ...user })
        .mockReturnValueOnce(null)

      usersRepo.save.mockReturnValue({ ...dto })

      expect(await userService.addUser(dto, user)).toEqual(true)
    })

    it('should throw error when user exist', () => {
      const dto: DTO.User.AddUser = {
        name: user.name,
        email: user.email,
        role: Role.SUPER_ADMIN,
      }

      usersRepo.findOne.mockReturnValue({ ...user }).mockReturnValue({ dto })

      expect(userService.addUser(dto, user)).rejects.toThrow(
        new BadRequestException(
          'User you want to add is exist, cannot add new user',
        ),
      )
    })
  })
})
