import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
  UnprocessableEntityException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { In, Not, Repository } from 'typeorm'

import {
  Action,
  ActionType,
  DefaultActionTarget,
} from 'src/action/action.entity'
import { DTO } from 'src/type'

import { Role } from './role.entity'
import { DefaultRoleName } from './role.subscriber'

@Injectable()
export class RoleService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Action) private actionRepo: Repository<Action>,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    const adminRole = await this.roleRepo.findOne({ where: { name: 'Admin' } })

    if (!adminRole) return
    if (adminRole.actions.length) return

    const adminAction = await this.actionRepo.findOne({
      where: { target: DefaultActionTarget.ADMIN, type: ActionType.IS_ADMIN },
    })

    if (!adminAction) return
    adminRole.actions = [adminAction]

    return this.roleRepo.save(adminRole)
  }

  getManyRole(dto: DTO.Role.GetManyRole) {
    const qb = this.roleRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.children', 'children')
      .leftJoinAndSelect('r.actions', 'actions')
      .loadRelationCountAndMap('r.usersCount', 'r.users')

    if (dto.shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit: dto.limit, page: dto.page })
  }

  async createRole(dto: DTO.Role.CreateRole) {
    const role = await this.roleRepo.findOne({ where: { name: dto.name } })
    if (role) throw new BadRequestException('Role existed')

    const actions = await this.actionRepo.find({
      where: { id: In(dto.actionsId) },
    })

    return this.roleRepo.save({
      name: dto.name,
      childrenIds: dto.childrenIds,
      actions: actions,
    })
  }

  async restoreDefault(id: string) {
    const role = await this.roleRepo.findOne(id)
    if (!role) throw new BadRequestException('Role does not exist')
    if (!role.default)
      throw new UnprocessableEntityException('Role is not default')

    if (role.name === DefaultRoleName.ADMIN) {
      role.actions = await this.actionRepo.find({
        where: { target: DefaultActionTarget.ADMIN, type: ActionType.IS_ADMIN },
      })
    } else if (role.name === DefaultRoleName.SALE) {
      role.actions = (
        await this.actionRepo.find({
          where: { type: ActionType.CAN_CREATE_NEW },
        })
      ).filter(
        ({ target }) =>
          target !== DefaultActionTarget.USER &&
          target !== DefaultActionTarget.ROLE,
      )
    }

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

    const actions = await this.actionRepo.find({
      where: { id: In(dto.actionsId) },
    })

    return this.roleRepo
      .save({
        ...role,
        ...dto,
        actions: actions,
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
