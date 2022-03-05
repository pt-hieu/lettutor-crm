import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { Log } from './log.entity'

@Injectable()
export class LogService {
  constructor(@InjectRepository(Log) private logRepo: Repository<Log>) {}

  create(dto: DTO.Log.CreateLog) {
    return this.logRepo.save(dto)
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
  }: DTO.Log.GetManyLogs) {
    const qb = this.logRepo.createQueryBuilder('l').leftJoin('l.owner', 'owner')

    if (owner) {
      qb.andWhere('owner.id = :id', { id: owner })
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
