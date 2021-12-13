import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DTO } from 'src/type'
import { FindOneOptions, Repository } from 'typeorm'
import { Deal } from './deal.entity'

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private dealRepo: Repository<Deal>,
  ) {}

  async getMany(query: DTO.Deal.GetManyQuery) {
    let q = this.dealRepo
      .createQueryBuilder('d')
      .leftJoin('d.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])
      .leftJoin('d.account', 'account')
      .addSelect(['account.fullName', 'account.description'])

    if (query.source)
      q.andWhere('d.source IN (:...source)', { source: query.source })

    if (query.stage)
      q.andWhere('d.stage IN (:...stage)', { stage: query.stage })

    if (query.search) {
      q = q.andWhere('d.fullName ILIKE :search', {
        search: `%${query.search}%`,
      })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getDealById(option: FindOneOptions<Deal>) {
    const deal = await this.dealRepo.findOne(option)

    if (!deal) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Deal not found`)
    }

    return deal
  }

  async addDeal(dto: DTO.Deal.AddDeal) {
    return this.dealRepo.save(dto)
  }

  async updateDeal(dto: DTO.Deal.UpdateDeal, id: string) {
    const deal = await this.getDealById({ where: { id } })

    return this.dealRepo.save({
      ...deal,
      ...dto,
    })
  }
}
