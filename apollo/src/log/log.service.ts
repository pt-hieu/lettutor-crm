import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { DTO } from 'src/type'

import { Log, LogAction, LogSource } from './log.entity'

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log) private logRepo: Repository<Log>,
    @InjectRepository(Note) private noteRepo: Repository<Note>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}

  async create(dto: DTO.Log.CreateLog) {
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

  async getMany({
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
      qb.andWhere('l.entityId IN (:...entities)', {
        entities: [entity],
      })
    }

    if (source) {
      if (entity)
        source = [source].concat(LogSource.NOTE, LogSource.TASK) as any

      qb.andWhere('l.source IN (:...source)', { source })
    }

    if (action) {
      qb.andWhere('l.action = :action', { action })
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
