import { ForbiddenException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { ContactService } from 'src/contact/contact.service'
import { DealService } from 'src/deal/deal.service'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { LeadService } from 'src/lead/lead.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { UserService } from 'src/user/user.service'
import { FindOneOptions, Repository } from 'typeorm'
import { Note, NoteSort, NoteSource } from './note.entity'

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,

    @Inject(forwardRef(() => LeadService))
    private readonly leadService: LeadService,

    @Inject(forwardRef(() => ContactService))
    private readonly contactService: ContactService,

    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,

    @Inject(forwardRef(() => DealService))
    private readonly dealService: DealService,

    private readonly userService: UserService,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,

  ) { }

  async addNote(dto: DTO.Note.AddNote) {
    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadId) {
      await this.leadService.getLeadById({
        where: { id: dto.leadId },
      })
      dto.accountId = null
      dto.contactId = null
      dto.dealId = null
      dto.source = NoteSource.LEAD
      return this.noteRepo.save(dto)
    }

    dto.leadId = null

    if (dto.accountId) {
      dto.dealId = null
    } else if (dto.dealId) {
      dto.source = NoteSource.DEAL
      dto.accountId = null
    }

    await Promise.all([
      dto.contactId
        ? this.contactService.getContactById({
          where: { id: dto.contactId },
        })
        : undefined,
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.dealId
        ? this.dealService.getDealById({ where: { id: dto.dealId } })
        : undefined,
    ])

    return this.noteRepo.save(dto)
  }

  getMany(query: DTO.Note.GetManyQuery) {
    let q = this.noteRepo
      .createQueryBuilder('note')
      .leftJoin('note.owner', 'owner')
      .leftJoin('note.lead', 'lead')
      .leftJoin('note.account', 'account')
      .leftJoin('note.deal', 'deal')
      .addSelect([
        'owner.name',
        'owner.email',
        'lead.fullName',
        'account.fullName',
        'deal.fullName',
      ])
    
    if (query.source === NoteSource.LEAD) {
      q.andWhere('note.leadId = :leadId', {
        leadId: query.sourceId
      } )
    }
    
    if (query.source === NoteSource.CONTACT) {
      q.andWhere('note.contactId = :contactId', {
        contactId: query.sourceId
      } )
    }
    
    if (query.source === NoteSource.ACCOUNT) {
      q.andWhere('note.accountId = :accountId', {
        accountId: query.sourceId
      } )
    }
    
    if (query.source === NoteSource.DEAL) {
      q.andWhere('note.dealId = :dealId', {
        dealId: query.sourceId
      } )
    }
    
    if (query.sort === NoteSort.FIRST) {
      q.addOrderBy('note.createdAt', 'DESC')
    }

    if (query.sort === NoteSort.LAST) {
      q.addOrderBy('note.createdAt', 'ASC')
    }

    if (query.nTopRecent) {
      q.limit(query.nTopRecent)
    }


    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getNoteById(option: FindOneOptions<Note>) {
    const note = await this.noteRepo.findOne(option)

    if (!note) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Note not found`)
    }

    if (
      !this.utilService.checkOwnership(note)
    ) {
      throw new ForbiddenException()
    }

    return note
  }


  async update(id: string, dto: DTO.Note.UpdateBody) {
    const note = await this.getNoteById({ where: { id } })

    await this.userService.getOneUserById({ where: { id: this.payloadService.data.id} })

    if (dto.leadId) {
      await this.leadService.getLeadById({
        where: { id: dto.leadId },
      })
      dto.contactId = null
      dto.accountId = null
      dto.dealId = null
      return this.noteRepo.save({ ...note, ...dto })
    }

    if (dto.contactId || dto.accountId || dto.dealId) {
      dto.leadId = null
      dto.accountId
        ? (dto.dealId = null)
        : dto.dealId
          ? (dto.accountId = null)
          : undefined

      await Promise.all([
        dto.contactId
          ? this.contactService.getContactById({ where: { id: dto.contactId } })
          : undefined,
        dto.accountId
          ? this.accountService.getAccountById({ where: { id: dto.accountId } })
          : undefined,
        dto.dealId
          ? this.dealService.getDealById({ where: { id: dto.dealId } })
          : undefined,
      ])
    }

    return this.noteRepo.save({ ...note, ...dto })
  }


  async delete(id: string) {
    const note = await this.getNoteById({ where: { id } })

    await this.userService.getOneUserById({ where: { id: this.payloadService.data.id } })

    return this.noteRepo.delete(note)
  }
}
