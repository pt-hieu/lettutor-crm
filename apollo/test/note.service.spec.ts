import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { Repository } from 'typeorm'
import { account, contact, deal, note, task, user } from './data'
import { Deal } from 'src/deal/deal.entity'
import { DealService } from 'src/deal/deal.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'
import { Account } from 'src/account/account.entity'
import { AccountService } from 'src/account/account.service'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { ContactService } from 'src/contact/contact.service'
import { LeadService } from 'src/lead/lead.service'
import { Lead } from 'src/lead/lead.entity'
import { Contact } from 'src/contact/contact.entity'
import { UtilService } from 'src/global/util.service'
import { NoteService } from 'src/note/note.service'
import { PayloadService } from 'src/global/payload.service'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { Role } from 'src/role/role.entity'
import { Note } from 'src/note/note.entity'

describe('note service', () => {
  let noteRepo: MockType<Repository<Note>>
  let noteService: NoteService
  let leadRepo: MockType<Repository<Lead>>
  let contactRepo: MockType<Repository<Contact>>
  let accountRepo: MockType<Repository<Account>>
  let dealRepo: MockType<Repository<Deal>>
  let userRepo: MockType<Repository<User>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        NoteService,
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
          provide: LeadService,
          useValue: {
            getLeadById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Note),
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
        {
          provide: getRepositoryToken(Account),
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
      ],
    }).compile()

    noteRepo = ref.get(getRepositoryToken(Note))
    noteService = ref.get(NoteService)
    leadRepo = ref.get(getRepositoryToken(Lead))
    contactRepo = ref.get(getRepositoryToken(Contact))
    accountRepo = ref.get(getRepositoryToken(Account))
    dealRepo = ref.get(getRepositoryToken(Deal))
    userRepo = ref.get(getRepositoryToken(User))
  })

  describe('add note', () => {
    it('should add note succeed with owner and lead', async () => {
      const dto: DTO.Note.AddNote = {
        ownerId: note.ownerId,
        leadId: note.leadId,
        title: note.title,
        content: note.content
      }

      userRepo.findOne.mockReturnValue({ ...user })
      noteRepo.save.mockReturnValue({ ...note })

      expect(await noteService.addNote(dto)).toEqual(note)
    })

    it('should add note successfully with owner, contact', async () => {
      const dto: DTO.Note.AddNote = {
        ownerId: note.ownerId,
        contactId: note.contactId,
        title: note.title,
        content: note.content
      }

      userRepo.findOne.mockReturnValue({ ...user })
      contactRepo.findOne.mockReturnValue({ ...contact })
      noteRepo.save.mockReturnValue({ ...note })

      expect(await noteService.addNote(dto)).toEqual(note)
    })

    it('should throw not found exception when owner not found', async () => {
      const dto: DTO.Note.AddNote = {
        ownerId: note.ownerId,
        title: note.title,
        content: note.content
      }
      userRepo.findOne.mockReturnValue(undefined)

      expect(noteService.addNote(dto)).rejects.toThrow(
        new NotFoundException('User does not exist'),
      )
    })


    it('should throw not found exception when contact not found', async () => {
      const dto: DTO.Note.AddNote = {
        ownerId: note.ownerId,
        title: note.title,
        content: note.content,
        contactId: note.contactId
      }

      userRepo.findOne.mockReturnValue({ ...user })
      contactRepo.findOne.mockReturnValue(undefined)

      expect(noteService.addNote(dto)).rejects.toThrow(
        new NotFoundException(`Contact not found`),
      )
    })

    it('should throw not found exception when account not found', async () => {
      const dto: DTO.Note.AddNote = {
        ownerId: note.ownerId,
        contactId: note.contactId,
        accountId: note.accountId,
        title: note.title,
        content: note.content
      }

      userRepo.findOne.mockReturnValue({ ...user })
      contactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue(undefined)

      expect(noteService.addNote(dto)).rejects.toThrow(
        new NotFoundException(`Account not found`),
      )
    })

    it('should throw not found exception when deal not found', async () => {
      const dto: DTO.Note.AddNote = {
        ownerId: note.ownerId,
        dealId: note.dealId,
        title: note.title,
        content: note.content
      }

      userRepo.findOne.mockReturnValue({ ...user })
      dealRepo.findOne.mockReturnValue(undefined)

      expect(noteService.addNote(dto)).rejects.toThrow(
        new NotFoundException(`Deal not found`),
      )
    })
  })

  describe('getMany', () => {
    it('should return tasks succeed', async () => {
      const dto: DTO.Note.GetManyQuery = {
        nTopRecent: 3,
        limit: 10,
        page: 1,
        shouldNotPaginate: true,
      }

      mockQueryBuilder.getMany.mockReturnValue([note])

      expect((await noteService.getMany(dto))).toEqual([note])
    })
  })

})
