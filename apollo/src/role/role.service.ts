import { BadRequestException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { DTO } from "src/type";
import { Not, Repository } from "typeorm";
import { Role } from "./role.entity";

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

  async updateRole(id: string, dto: DTO.Role.UpdateRole) {
    const role = await this.roleRepo.findOne(id)
    if (!role) throw new BadRequestException('Role does not exist')

    if (
      dto.name &&
      (await this.roleRepo.findOne({ where: { name: dto.name, id: Not(id) } }))
    )
      throw new BadRequestException('Name has been taken')

    this.eventEmitter.emit('auth.invalidate', id)

    return this.roleRepo.save({
      ...role,
      ...dto,
    })
  }

  async removeRole(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } })
    if (!role) throw new BadRequestException('Role does not exist')

    return this.roleRepo.remove(role)
  }

  
}