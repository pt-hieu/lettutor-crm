import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, In, Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'

import { Link, LinkSort } from './link.entity'

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private LinkRepo: Repository<Link>,
    private readonly utilService: UtilService,
  ) {}

  async getLinkById(option: FindOneOptions<Link>) {
    const link = await this.LinkRepo.findOne(option)

    if (!link) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Lead not found`)
    }

    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(link) &&
      !this.utilService.checkRoleAction(Actions.VIEW_ALL_ATTACHMENTS)
    ) {
      throw new ForbiddenException()
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
    sort,
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

    if (sort === LinkSort.FIRST) {
      qb.addOrderBy('link.createdAt', 'DESC')
    }

    if (sort === LinkSort.LAST) {
      qb.addOrderBy('link.createdAt', 'ASC')
    }

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }

  async deleteLink(ids: string[]) {
    const links = await this.LinkRepo.find({ where: { id: In(ids) } })

    for (const link of links) {
      if (
        !this.utilService.checkOwnership(link) &&
        !this.utilService.checkRoleAction(Actions.DELETE_ATTACHMENTS)
      ) {
        throw new ForbiddenException()
      }
    }

    return this.LinkRepo.softRemove(links)
  }
}
