import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { ContactService } from 'src/contact/contact.service'
import { DealService } from 'src/deal/deal.service'
import { LeadService } from 'src/lead/lead.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { UserService } from 'src/user/user.service'
import { Repository } from 'typeorm'
import { Note } from './note.entity'

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
      return this.noteRepo.save(dto)
    }

    dto.leadId = null
    if (dto.accountId) {
      dto.dealId = null
    } else if(dto.dealId) {
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
      .createQueryBuilder('t')
      .leftJoin('t.owner', 'owner')
      .leftJoin('t.lead', 'lead')
      .leftJoin('t.account', 'account')
      .leftJoin('t.deal', 'deal')
      .addSelect([
        'owner.name',
        'owner.email',
        'lead.fullName',
        'account.fullName',
        'deal.fullName',
      ])

    q.orderBy('t.createdAt', 'DESC')
    if (query.topRecent) {
      q.limit(query.topRecent)
    }
    
    
    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }
}
