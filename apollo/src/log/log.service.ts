import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { Log, LogAction } from './log.entity'

@Injectable()
export class LogService {
  constructor(@InjectRepository(Log) private logRepo: Repository<Log>) {}

  create(dto: DTO.Log.CreateLog) {
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
      qb.andWhere('l.entityId = :entity', { entity })
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
