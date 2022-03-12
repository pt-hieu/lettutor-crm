import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

import { NoteService } from 'src/note/note.service'
import { TaskService } from 'src/task/task.service'
import { DTO } from 'src/type'

import { Log, LogAction, LogSource } from './log.entity'

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log) private logRepo: Repository<Log>,

    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    private readonly noteService: NoteService,
  ) {}

  async create(dto: DTO.Log.CreateLog) {
    if (dto.source === LogSource.TASK) {
      const task = await this.taskService.getTaskById({
        where: { id: dto.entityId },
      })

      dto.taskId = null
      dto.leadId = task.leadId
      dto.contactId = task.contactId
      dto.accountId = task.accountId
      dto.dealId = task.dealId
    }

    console.log(dto)

    if (dto.source === LogSource.NOTE) {
      const note = await this.noteService.getNoteById({
        where: { id: dto.entityId },
      })

      dto.taskId = note.taskId
      dto.leadId = note.leadId
      dto.contactId = note.contactId
      dto.accountId = note.accountId
      dto.dealId = note.dealId
    }

    return this.logRepo.save({
      ...dto,
      deleted: dto.action === LogAction.DELETE,
    })
  }

  async updateDeleteEntity(id: string) {
    const logs = await this.logRepo.find({ where: { entityId: id } })
    return this.logRepo.save(
      logs.map((log) => ({
        ...log,
        deleted: true,
      })),
    )
  }

  getMany({
    limit,
    page,
    action,
    from,
    owner,
    property,
    shouldNotPaginate,
    source,
    to,
    entity,
  }: DTO.Log.GetManyLogs) {
    const qb = this.logRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.owner', 'owner')
      .orderBy('l.createdAt', 'DESC')

    if (owner) {
      qb.andWhere('l.ownerId = :owner', { owner })
    }

    if (entity) {
      qb.andWhere((q) => {
        q.where('l.entityId = :entity', { entity })
          .orWhere('l.leadId = :entity', { entity })
          .orWhere('l.contactId = :entity', { entity })
          .orWhere('l.dealId = :entity', { entity })
          .orWhere('l.accountId = :entity', { entity })
          .orWhere('l.taskId = :entity', { entity })
      })
    }

    if (action) {
      qb.andWhere('l.action = :action', { action })
    }

    if (source) {
      qb.andWhere('l.source = :source', { source })
    }

    if (from) {
      qb.andWhere('l.createdAt > :from', { from: from.toISOString() })
    }

    if (to) {
      qb.andWhere('l.createdAt < :to', { to: to.toISOString() })
    }

    if (property) {
      qb.andWhere(
        `jsonb_path_query_array(l.changes, '$[*] ? (@.name == "${property}")') @> :filter::jsonb`,
        {
          filter: JSON.stringify([{ name: property }]),
        },
      )
    }

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }
}
