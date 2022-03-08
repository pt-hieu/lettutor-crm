import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { Not, Repository } from 'typeorm'

import { DTO } from 'src/type'

import { Role } from './role.entity'
import { RoleActionMapping } from './role.subscriber'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private eventEmitter: EventEmitter2,
  ) {}

  getManyRole(dto: DTO.Role.GetManyRole) {
    const qb = this.roleRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.children', 'children')
      .loadRelationCountAndMap('r.usersCount', 'r.users')

    if (dto.shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit: dto.limit, page: dto.page })
  }

  async createRole(dto: DTO.Role.CreateRole) {
    const role = await this.roleRepo.findOne({ where: { name: dto.name } })
    if (role) throw new BadRequestException('Role existed')

    return this.roleRepo.save({
      name: dto.name,
      childrenIds: dto.childrenIds,
      actions: dto.actions,
    })
  }

  async restoreDefault(id: string) {
    const role = await this.roleRepo.findOne(id)
    if (!role) throw new BadRequestException('Role does not exist')
    if (!role.default)
      throw new UnprocessableEntityException('Role is not default')

    role.actions = RoleActionMapping[role.name]

    return this.roleRepo.save(role).then((res) => {
      this.eventEmitter.emit('auth.invalidate', id)
      return res
    })
  }

  async updateRole(id: string, dto: DTO.Role.UpdateRole) {
    const role = await this.roleRepo.findOne(id)
    if (!role) throw new BadRequestException('Role does not exist')

    if (
      dto.name &&
      (await this.roleRepo.findOne({ where: { name: dto.name, id: Not(id) } }))
    )
      throw new BadRequestException('Name has been taken')

    return this.roleRepo
      .save({
        ...role,
        ...dto,
      })
      .then((res) => {
        this.eventEmitter.emit('auth.invalidate', id)
        return res
      })
  }

  async removeRole(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } })

    if (!role) throw new BadRequestException('Role does not exist')
    if (role.default) {
      throw new BadRequestException('This role can not be deleted')
    }

    return this.roleRepo.remove(role)
  }
}
