import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { Deal } from './deal.entity'

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private dealRepo: Repository<Deal>,
  ) {}

  async getDealById(id: string) {
    const found = await this.dealRepo.findOne({ id })

    if (!found) {
      throw new NotFoundException(`Deal with ID ${id} not found`)
    }

    return found
  }

  async addDeal(dto: DTO.Deal.AddDeal) {
    return this.dealRepo.save(dto)
  }

  async updateDeal(dto: DTO.Deal.UpdateDeal, id: string) {
    const deal = await this.getDealById(id)

    return this.dealRepo.save({
      ...deal,
      ...dto,
    })
  }

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
}
