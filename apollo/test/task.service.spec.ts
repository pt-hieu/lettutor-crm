import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { MockType, repositoryMockFactory, mockQueryBuilder } from './utils'
import { Repository } from 'typeorm'
import { account, contact, deal, lead, task, user } from './data'
import { Deal } from 'src/deal/deal.entity'
import { DealService } from 'src/deal/deal.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'
import { Account } from 'src/account/account.entity'
import { AccountService } from 'src/account/account.service'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { ContactService } from 'src/lead-contact/contact.service'
import { Role, User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { TaskService } from 'src/task/task.service'
import { Task } from 'src/task/task.entity'
import { LeadService } from 'src/lead-contact/lead.service'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'

describe('task service', () => {
  let taskRepo: MockType<Repository<Deal>>
  let taskService: TaskService
  let dealRepo: MockType<Repository<Deal>>
  let dealService: DealService
  let accountRepo: MockType<Repository<Account>>
  let accountService: AccountService
  let leadContactRepo: MockType<Repository<LeadContact>>
  let contactService: ContactService
  let leadService: LeadService
  let userRepo: MockType<Repository<User>>
  let userService: UserService
  let roleRepo: MockType<Repository<Role>>
  let mailService: MailService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        DealService,
        AccountService,
        ContactService,
        UserService,
        LeadService,
        {
          provide: MailService,
          useValue: {
            sendResetPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
            sendAddPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Account),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(LeadContact),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    taskRepo = ref.get(getRepositoryToken(Task))
    taskService = ref.get(TaskService)
    dealRepo = ref.get(getRepositoryToken(Deal))
    dealService = ref.get(DealService)
    leadContactRepo = ref.get(getRepositoryToken(LeadContact))
    roleRepo = ref.get(getRepositoryToken(Role))
    accountRepo = ref.get(getRepositoryToken(Account))
    userRepo = ref.get(getRepositoryToken(User))
    contactService = ref.get(ContactService)
    leadService = ref.get(LeadService)
    mailService = ref.get(MailService)
    accountService = ref.get(AccountService)
    userService = ref.get(UserService)
  })

  describe('add task', () => {
    it('should add task succeed with owner and lead', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        leadId: task.leadId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...lead })
      taskRepo.save.mockReturnValue({ ...task })

      expect(await taskService.addTask(dto)).toEqual(task)
    })

    it('should add task succeed with owner, contact and account', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        contactId: task.contactId,
        accountId: task.accountId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue({ ...account })
      taskRepo.save.mockReturnValue({ ...task })

      expect(await taskService.addTask(dto)).toEqual(task)
    })

    it('should add task succeed with owner, contact and deal', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        contactId: task.contactId,
        dealId: task.dealId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      dealRepo.findOne.mockReturnValue({ ...deal })
      taskRepo.save.mockReturnValue({ ...task })

      expect(await taskService.addTask(dto)).toEqual(task)
    })

    it('should throw not found exception when owner not found', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue(undefined)

      expect(taskService.addTask(dto)).rejects.toThrow(
        new NotFoundException('User does not exist'),
      )
    })

    it('should throw not found exception when lead not found', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        leadId: task.leadId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(taskService.addTask(dto)).rejects.toThrow(
        new NotFoundException(`Lead not found`),
      )
    })

    it('should throw not found exception when contact not found', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        contactId: task.contactId,
        accountId: task.accountId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue(undefined)
      accountRepo.findOne.mockReturnValue({ ...account })

      expect(taskService.addTask(dto)).rejects.toThrow(
        new NotFoundException(`Contact not found`),
      )
    })

    it('should throw not found exception when account not found', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        contactId: task.contactId,
        accountId: task.accountId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue(undefined)

      expect(taskService.addTask(dto)).rejects.toThrow(
        new NotFoundException(`Account not found`),
      )
    })

    it('should throw not found exception when deal not found', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        contactId: task.contactId,
        dealId: task.dealId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      dealRepo.findOne.mockReturnValue(undefined)

      expect(taskService.addTask(dto)).rejects.toThrow(
        new NotFoundException(`Deal not found`),
      )
    })
  })

  describe('getMany', () => {
    it('should return tasks succeed', async () => {
      const dto: DTO.Task.GetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([task])

      expect(
        ((await taskService.getMany(dto, user)) as Pagination<Task, IPaginationMeta>)
          .items,
      ).toEqual([task])
    })
  })

  describe('view task detail', () => {
    it('should view task detail succeed', async () => {
      taskRepo.findOne.mockReturnValue({ ...task })

      expect(await taskService.getTaskById({ where: { id: task.id } })).toEqual(
        task,
      )
    })

    it('should throw exception when task not found', () => {
      taskRepo.findOne.mockReturnValue(undefined)

      expect(
        taskService.getTaskById({ where: { id: task.id } }),
      ).rejects.toThrow(new NotFoundException(`Task not found`))
    })
  })

})
