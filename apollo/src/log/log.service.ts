import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

import { AccountService } from 'src/account/account.service'
import { ContactService } from 'src/contact/contact.service'
import { DealService } from 'src/deal/deal.service'
import { LeadService } from 'src/lead/lead.service'
import { TaskService } from 'src/task/task.service'
import { DTO } from 'src/type'

import { Log, LogAction, LogSource } from './log.entity'

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log) private logRepo: Repository<Log>,

    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    private readonly accountService: AccountService,
    private readonly contactService: ContactService,
    private readonly leadService: LeadService,
    private readonly dealService: DealService,
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
    entities,
  }: DTO.Log.GetManyLogs) {
    const qb = this.logRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.owner', 'owner')
      .orderBy('l.createdAt', 'DESC')

    if (owner) {
      qb.andWhere('l.ownerId = :owner', { owner })
    }

    if (entities) {
      if (typeof entities === 'string') {
        qb.andWhere('l.entityId = :entities', { entities })
      } else {
        qb.andWhere('l.entityId in (:...entities)', { entities })
      }
    }

    if (source) {
      qb.andWhere('l.source = :source', { source })
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
