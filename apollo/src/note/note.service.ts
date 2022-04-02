import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, In, Repository } from 'typeorm'

import { File } from 'src/file/file.entity'
import { FileService } from 'src/file/file.service'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { TaskService } from 'src/task/task.service'
import { DTO } from 'src/type'

import { Note, NoteFilter, NoteSort, NoteSource } from './note.entity'

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,

    @InjectRepository(File)
    private fileRepo: Repository<File>,

    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,

    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
    private readonly fileService: FileService,
  ) {}

  async addNote(dto: DTO.Note.AddNote) {
    // let filesToAdd: File[] = []
    // if (dto.files && dto.files.length > 0) {
    //   filesToAdd = await this.fileService.uploadFile(dto.files)
    // }
    // delete dto.files
    // if (dto.contactId && dto.source === NoteSource.CONTACT) {
    //   const contact = await this.contactService.getContactById({
    //     where: { id: dto.contactId },
    //   })
    //   dto.source = NoteSource.CONTACT
    //   dto.accountId = contact.accountId
    // }
    // if (dto.dealId && dto.source === NoteSource.DEAL) {
    //   const deal = await this.dealService.getDealById({
    //     where: { id: dto.dealId },
    //   })
    //   dto.accountId = deal.accountId
    // }
    // if (dto.taskId && dto.source === NoteSource.TASK) {
    //   const task = await this.taskService.getTaskById({
    //     where: { id: dto.taskId },
    //   })
    //   dto.leadId = task.leadId
    //   dto.contactId = task.contactId
    //   dto.accountId = task.accountId
    //   dto.dealId = task.dealId
    // }
    // dto.ownerId = this.payloadService.data.id
    // return this.noteRepo.save({ ...dto, attachments: filesToAdd })
  }

  getMany(query: DTO.Note.GetManyQuery) {
    const q = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.attachments', 'attachments')
      .leftJoin('note.owner', 'owner')
      .leftJoin('note.lead', 'lead')
      .leftJoin('note.contact', 'contact')
      .leftJoin('note.account', 'account')
      .leftJoin('note.deal', 'deal')
      .leftJoin('note.task', 'task')
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
        'task.id',
        'task.subject',
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
      if (query.filter === NoteFilter.ACCOUNT_ONLY) {
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

    if (query.source === NoteSource.TASK) {
      q.andWhere('note.taskId = :taskId', {
        taskId: query.sourceId,
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
    let note = await this.getNoteById({ where: { id } })

    let filesToAdd: File[] = []
    if (dto.files && dto.files.length > 0) {
      filesToAdd = await this.fileService.uploadFile(dto.files)
    }

    const filesToDelete = note.attachments.filter(
      (file) => !dto.attachments.includes(file.id),
    )

    await this.fileRepo.remove(filesToDelete)
    note = await this.getNoteById({ where: { id } })

    return this.noteRepo.save({
      ...note,
      ...dto,
      attachments: [...note.attachments, ...filesToAdd],
    })
  }

  async batchDelete(ids: string[]) {
    const notes = await this.noteRepo.find({ where: { id: In(ids) } })
    return this.noteRepo.softRemove(notes)
  }
}
