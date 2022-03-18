import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, Repository } from 'typeorm'

import { DTO } from 'src/type'

import { Link } from './link.entity'

@Injectable()
export class LinkService {
  constructor(@InjectRepository(Link) private LinkRepo: Repository<Link>) {}

  async getLinkById(option: FindOneOptions<Link>) {
    const link = await this.LinkRepo.findOne(option)

    if (!link) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Lead not found`)
    }

    return link
  }

  async addLink(dto: DTO.Link.AddLink) {
    return this.LinkRepo.save(dto)
  }

  async updateLink(dto: DTO.Link.UpdateLink, id: string) {
    const link = await this.getLinkById({ where: { id } })

    return this.LinkRepo.save({
      ...link,
      ...dto,
    })
  }

  async getMany({
    limit,
    page,
    owner,
    shouldNotPaginate,
    source,
    entity,
  }: DTO.Link.GetManyLinks) {
    const qb = this.LinkRepo.createQueryBuilder('link')
      .leftJoinAndSelect('link.owner', 'owner')
      .orderBy('link.createdAt', 'DESC')

    if (owner) {
      qb.andWhere('link.ownerId = :owner', { owner })
    }

    if (entity) {
      qb.andWhere('link.entityId = :entities', { entity })
    }

    if (source) {
      qb.andWhere('link.source = :source', { source })
    }

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }
}
