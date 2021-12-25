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

  describe('edit task', () => {
    it('should update task succeed with owner and subject', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...lead })
      taskRepo.findOne.mockReturnValue({ ...task })
      taskRepo.save.mockReturnValue({ ...task })

      expect(await taskService.update(task.id, dto)).toEqual(task)
    })
    it('should update task succeed with leadId', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        subject: task.subject,
        leadId: task.leadId,
        contactId: task.contactId,
      }
      const result = {
        ...task,
        contactId: null,
        dealId: null,
        accountId: null,
      }
      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...lead })
      taskRepo.findOne.mockReturnValue({ ...task })
      taskRepo.save.mockReturnValue(result)

      expect(await taskService.update(task.id, dto)).toEqual(result)
    })

    it('should update task succeed with contactId', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        subject: task.subject,
        contactId: task.contactId,
      }
      const result = {
        ...task,
        leadId: null,
        dealId: null,
        accountId: null,
      }
      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...lead })
      taskRepo.findOne.mockReturnValue({ ...task })
      taskRepo.save.mockReturnValue(result)

      expect(await taskService.update(task.id, dto)).toEqual(result)
    })
    it('should throw not found exception when task not found', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      taskRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Task not found`),
      )
    })
    it('should throw not found exception when lead not found', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        leadId: task.leadId,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      taskRepo.findOne.mockReturnValue({ ...task })
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Lead not found`),
      )
    })
    it('should throw not found exception when contact not found', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        contactId: task.contactId,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      taskRepo.findOne.mockReturnValue({ ...task })
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Contact not found`),
      )
    })
    it('should throw not found exception when account not found', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        accountId: task.accountId,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      taskRepo.findOne.mockReturnValue({ ...task })
      accountRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Account not found`),
      )
    })
    it('should throw not found exception when deal not found', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        dealId: task.dealId,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      taskRepo.findOne.mockReturnValue({ ...task })
      dealRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Deal not found`),
      )
    })
  })
})
