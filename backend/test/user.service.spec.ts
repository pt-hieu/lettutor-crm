import { MailService } from 'src/mail/mail.service'
import { DTO } from 'src/type'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { user } from './data'
import { MockType, repositoryMockFactory } from './utils'

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
  })
})
