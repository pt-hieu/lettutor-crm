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
import { Entity } from 'src/module/module.entity'
import { TaskService } from 'src/task/task.service'
import { DTO } from 'src/type'

import { Note, NoteSort } from './note.entity'

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,

    @InjectRepository(File)
    private fileRepo: Repository<File>,

    @InjectRepository(Entity)
    private entityRepo: Repository<Entity>,

    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,

    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
    private readonly fileService: FileService,
  ) {}

  async addNote(dto: DTO.Note.AddNote) {
    let filesToAdd: File[] = []
    if (dto.files && dto.files.length > 0) {
      filesToAdd = await this.fileService.uploadFile(dto.files)
    }
    delete dto.files

    if (dto.entityId) {
      await this.entityRepo.find({
        where: { id: dto.entityId },
      })
    }

    if (dto.taskId) {
      await this.taskService.getTaskById({
        where: { id: dto.taskId },
      })
    }
    dto.ownerId = this.payloadService.data.id
    return this.noteRepo.save({ ...dto, attachments: filesToAdd })
  }

  getMany(query: DTO.Note.GetManyQuery) {
    const q = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.attachments', 'attachments')
      .leftJoin('note.owner', 'owner')
      .leftJoin('note.entity', 'entity')
      .leftJoin('note.task', 'task')
      .addSelect([
        'owner.name',
        'owner.email',
        'entity.id',
        'entity.name',
        'task.id',
        'task.name',
      ])

    if (query.source === 'task') {
      q.andWhere('note.taskId = :taskId', {
        taskId: query.sourceId,
      })
    } else {
      q.andWhere('note.entityId = :entityId', {
        entityId: query.sourceId,
      })
    }

    // if (query.source === NoteSource.ACCOUNT) {
    //   q.andWhere('note.accountId = :accountId', {
    //     accountId: query.sourceId,
    //   })
    //   if (query.filter === NoteFilter.ACCOUNT_ONLY) {
    //     q.andWhere('note.source = :source', {
    //       source: NoteSource.ACCOUNT,
    //     })
    //   }
    // }

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

    if (!dto.attachments) {
      dto.attachments = []
    }

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

  async updateAllNotes(notes: Note[]) {
    await this.noteRepo.save(notes)
  }

  async batchDelete(ids: string[]) {
    const notes = await this.noteRepo.find({ where: { id: In(ids) } })
    return this.noteRepo.softRemove(notes)
  }
}
