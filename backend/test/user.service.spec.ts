import { MailService } from 'src/mail/mail.service'
import { DTO } from 'src/type'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { user } from './data'
import { MockType, repositoryMockFactory } from './utils'
import moment from 'moment'
import { BadRequestException } from '@nestjs/common'
import { hash } from 'bcrypt'

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

      usersRepo.findOne.mockReturnValue(user)
      usersRepo.save.mockReturnValue(user)

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
    it('shoudl find succeeed', async () => {
      const dto: DTO.User.FindByTokenQuery = {
        token: user.resetPasswordToken,
      }

      usersRepo.findOne.mockReturnValue(user)
      expect(await userService.findByResetPwdToken(dto)).toEqual(true)
    })

    it('should throw error when token does not exist', () => {
      const dto: DTO.User.FindByTokenQuery = {
        token: user.resetPasswordToken,
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
        token: user.resetPasswordToken,
      }

      usersRepo.findOne.mockReturnValue(user)
      usersRepo.save.mockReturnValue(user)

      expect(await userService.resetPwd(dto)).toEqual(user)
    })

    it('shoud throw error when user does not exist', () => {
      const dto: DTO.User.ResetPwd = {
        password: user.password,
        token: user.resetPasswordToken,
      }

      usersRepo.findOne.mockReturnValue(undefined)
      expect(userService.resetPwd(dto)).rejects.toThrow(
        new BadRequestException('User does not exist'),
      )
    })

    it('should throw error when token is expire', () => {
      const dto: DTO.User.ResetPwd = {
        password: user.password,
        token: user.resetPasswordToken,
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

  // describe('change password', () => {
  //   it('should change pwd succeed', async () => {
  //     const dto: DTO.User.ChangePwd = {
  //       oldPassword: '123',
  //       newPassword: 'new@Password',
  //       confirmPassword: 'new@Password',
  //     }

  //     usersRepo.save.mockReturnValue(user)

  //     expect(await userService.changePwd(dto, user)).toEqual(user)
  //   })

  //   it('should throw error when old password not match current password', async () => {
  //     const dto: DTO.User.ChangePwd = {
  //       oldPassword: 'Old@Password',
  //       newPassword: 'new@Password',
  //       confirmPassword: 'new@Password',
  //     }
  //     usersRepo.save.mockReturnValue(user)

  //     expect(await userService.changePwd(dto, user)).rejects.toThrow(
  //       new BadRequestException('Old password is wrong'),
  //     )
  //   })

  //   it('should throw error when new password match current password', async () => {
  //     const dto: DTO.User.ChangePwd = {
  //       oldPassword: '123',
  //       newPassword: '123',
  //       confirmPassword: '123',
  //     }

  //     usersRepo.save.mockReturnValue(user)

  //     expect(await userService.changePwd(dto, user)).rejects.toThrow(
  //       new BadRequestException('New password must differ from old password'),
  //     )
  //   })

  //   it('should throw error when confirm password not match new password', async () => {
  //     const dto: DTO.User.ChangePwd = {
  //       oldPassword: '123',
  //       newPassword: 'new@Password',
  //       confirmPassword: 'confirm@Password',
  //     }
  //     user.password = await hash(user.password, 10)
  //     usersRepo.save.mockReturnValue(user)

  //     expect(await userService.changePwd(dto, user)).rejects.toThrow(
  //       new BadRequestException('Confirm password not match'),
  //     )
  //   })
  // })
})
