import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { MockType, repositoryMockFactory, mockQueryBuilder } from './utils'
import { Repository } from 'typeorm'
import { account, contact, deal, task, user } from './data'
import { Deal } from 'src/deal/deal.entity'
import { DealService } from 'src/deal/deal.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'
import { Account } from 'src/account/account.entity'
import { AccountService } from 'src/account/account.service'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { TaskService } from 'src/task/task.service'
import { Task } from 'src/task/task.entity'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { ContactService } from 'src/contact/contact.service'
import { LeadService } from 'src/lead/lead.service'
import { Lead } from 'src/lead/lead.entity'
import { Contact } from 'src/contact/contact.entity'
import { UtilService } from 'src/global/util.service'
import { NoteService } from 'src/note/note.service'
import { PayloadService } from 'src/global/payload.service'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { Role } from 'src/role/role.entity'

describe('task service', () => {
  let taskRepo: MockType<Repository<Deal>>
  let taskService: TaskService
  let dealRepo: MockType<Repository<Deal>>
  let accountRepo: MockType<Repository<Account>>
  let contactRepo: MockType<Repository<Contact>>
  let userRepo: MockType<Repository<User>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        TaskService,
        DealService,
        AccountService,
        ContactService,
        UserService,
        PayloadService,
        {
          provide: UtilService,
          useValue: {
            checkOwnership: jest.fn().mockReturnValue(true),
            checkRoleAction: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendResetPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
            sendAddPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
          },
        },
        {
          provide: NoteService,
          useValue: {
            addNote: jest.fn(),
          },
        },
        {
          provide: LeadService,
          useValue: {
            getLeadById: jest.fn(),
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
          provide: getRepositoryToken(Lead),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Contact),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    taskRepo = ref.get(getRepositoryToken(Task))
    taskService = ref.get(TaskService)
    dealRepo = ref.get(getRepositoryToken(Deal))
    contactRepo = ref.get(getRepositoryToken(Contact))
    accountRepo = ref.get(getRepositoryToken(Account))
    userRepo = ref.get(getRepositoryToken(User))
  })

  describe('add task', () => {
    it('should add task succeed with owner and lead', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        leadId: task.leadId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
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
      contactRepo.findOne.mockReturnValue({ ...contact })
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
      contactRepo.findOne.mockReturnValue({ ...contact })
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

    // it('should throw not found exception when lead not found', async () => {
    //   const dto: DTO.Task.AddTask = {
    //     ownerId: task.ownerId,
    //     leadId: task.leadId,
    //     subject: task.subject,
    //   }

    //   userRepo.findOne.mockReturnValue({ ...user })
    //   leadRepo.findOne.mockReturnValue(undefined)

    //   expect(taskService.addTask(dto)).rejects.toThrow(
    //     new NotFoundException(`Lead not found`),
    //   )
    // })

    it('should throw not found exception when contact not found', async () => {
      const dto: DTO.Task.AddTask = {
        ownerId: task.ownerId,
        contactId: task.contactId,
        accountId: task.accountId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      contactRepo.findOne.mockReturnValue(undefined)
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
      contactRepo.findOne.mockReturnValue({ ...contact })
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
      contactRepo.findOne.mockReturnValue({ ...contact })
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
        ((await taskService.getMany(dto)) as Pagination<Task, IPaginationMeta>)
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

  describe('edit task', () => {
    it('should update task succeed with owner and subject', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        subject: task.subject,
      }

      userRepo.findOne.mockReturnValue({ ...user })
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
      contactRepo.findOne.mockReturnValue({ ...contact })
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
      contactRepo.findOne.mockReturnValue({ ...contact })
      taskRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Task not found`),
      )
    })
    // it('should throw not found exception when lead not found', async () => {
    //   const dto: DTO.Task.UpdateBody = {
    //     ownerId: task.ownerId,
    //     leadId: task.leadId,
    //   }

    //   userRepo.findOne.mockReturnValue({ ...user })
    //   taskRepo.findOne.mockReturnValue({ ...task })
    //   leadRepo.findOne.mockReturnValue(undefined)

    //   expect(taskService.update(task.id, dto)).rejects.toThrow(
    //     new NotFoundException(`Lead not found`),
    //   )
    // })
    it('should throw not found exception when contact not found', async () => {
      const dto: DTO.Task.UpdateBody = {
        ownerId: task.ownerId,
        contactId: task.contactId,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      taskRepo.findOne.mockReturnValue({ ...task })
      contactRepo.findOne.mockReturnValue(undefined)

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
      contactRepo.findOne.mockReturnValue({ ...contact })
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
      contactRepo.findOne.mockReturnValue({ ...contact })
      taskRepo.findOne.mockReturnValue({ ...task })
      dealRepo.findOne.mockReturnValue(undefined)

      expect(taskService.update(task.id, dto)).rejects.toThrow(
        new NotFoundException(`Deal not found`),
      )
    })
  })
})
