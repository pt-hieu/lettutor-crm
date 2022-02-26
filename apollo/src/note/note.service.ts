import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { ContactService } from 'src/contact/contact.service'
import { DealService } from 'src/deal/deal.service'
import { FileService } from 'src/file/file.service'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { LeadService } from 'src/lead/lead.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { UserService } from 'src/user/user.service'
import { note } from 'test/data'
import { FindOneOptions, In, Repository } from 'typeorm'
import { Note, NoteFilter, NoteSort, NoteSource } from './note.entity'

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
    private readonly fileService: FileService,
  ) {}

  async addNote(dto: DTO.Note.AddNote, files?: Express.Multer.File[]) {
    await this.userService.getOneUserById({
      where: { id: this.payloadService.data.id },
    })

    let filesToAdd = []

    if (files && files.length > 0) {
      filesToAdd = await this.fileService.uploadFile(files)
    }

    if (dto.leadId && dto.source == NoteSource.LEAD) {
      await this.leadService.getLeadById({
        where: { id: dto.leadId },
      })
      dto.accountId = null
      dto.contactId = null
      dto.dealId = null
      dto.ownerId = this.payloadService.data.id
      dto.source = NoteSource.LEAD
      return this.noteRepo.save({ ...dto, files: filesToAdd })
    }

    dto.leadId = null

    if (dto.contactId && dto.source == NoteSource.CONTACT) {
      const contact = await this.contactService.getContactById({
        where: { id: dto.contactId },
      })
      dto.source = NoteSource.CONTACT
      dto.accountId = contact.accountId
    }

    if (dto.accountId && dto.source == NoteSource.ACCOUNT) {
      dto.dealId = null
    }
    if (dto.dealId && dto.source == NoteSource.DEAL) {
      const deal = await this.dealService.getDealById({
        where: { id: dto.dealId },
      })
      dto.accountId = deal.accountId
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

    dto.ownerId = this.payloadService.data.id
    return this.noteRepo.save({ ...dto, files: filesToAdd })
  }

  getMany(query: DTO.Note.GetManyQuery) {
    let q = this.noteRepo
      .createQueryBuilder('note')
      .leftJoin('note.owner', 'owner')
      .leftJoin('note.lead', 'lead')
      .leftJoin('note.contact', 'contact')
      .leftJoin('note.account', 'account')
      .leftJoin('note.deal', 'deal')
      .addSelect([
        'owner.name',
        'owner.email',
        'lead.id',
        'lead.fullName',
        'contact.id',
        'contact.fullName',
        'account.id',
        'account.fullName',
        'deal.id',
        'deal.fullName',
      ])

    if (query.source === NoteSource.LEAD) {
      q.andWhere('note.leadId = :leadId', {
        leadId: query.sourceId,
      })
    }

    if (query.source === NoteSource.CONTACT) {
      q.andWhere('note.contactId = :contactId', {
        contactId: query.sourceId,
      })
    }

    if (query.source === NoteSource.ACCOUNT) {
      q.andWhere('note.accountId = :accountId', {
        accountId: query.sourceId,
      })
      if (query.filter == NoteFilter.ACCOUNT_ONLY) {
        q.andWhere('note.source = :source', {
          source: NoteSource.ACCOUNT,
        })
      }
    }

    if (query.source === NoteSource.DEAL) {
      q.andWhere('note.dealId = :dealId', {
        dealId: query.sourceId,
      })
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
    return paginate(q, { limit: query.nTopRecent, page: query.page })
  }

  async getNoteById(option: FindOneOptions<Note>) {
    const note = await this.noteRepo.findOne(option)

    if (!note) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Note not found`)
    }

    if (!this.utilService.checkOwnership(note)) {
      throw new ForbiddenException()
    }

    return note
  }

  async update(id: string, dto: DTO.Note.UpdateBody) {
    const note = await this.getNoteById({ where: { id } })

    await this.userService.getOneUserById({
      where: { id: this.payloadService.data.id },
    })

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

  async batchDelete(ids: string[]) {
    const notes = await this.noteRepo.find({ where: { id: In(ids) } })
    return this.noteRepo.remove(notes)
  }
}
