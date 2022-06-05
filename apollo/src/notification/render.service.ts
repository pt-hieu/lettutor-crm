import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { Entity } from 'src/module/module.entity'
import { Role } from 'src/role/role.entity'
import { User } from 'src/user/user.entity'

import { Action, Notification } from './notification.entity'

@Injectable()
export class RenderService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Entity) private entityRepo: Repository<Entity>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  renderNotification(noti: Notification) {
    if (noti.action === Action.ASSIGN_ENTITY) {
      return this.renderAssignEntityNoti(noti)
    }

    if (noti.action === Action.CHANGE_ROLE) {
      return this.renderChangeRoleNoti(noti)
    }
  }

  private async renderAssignEntityNoti(noti: Notification) {
    const factor = await this.userRepo.findOne({
      where: { id: noti.factorIds[0] },
    })

    const target = await this.entityRepo.findOne({
      where: { id: noti.targetId },
    })

    return `${factor?.name || 'A user'} has assign [${
      target?.module?.name || '?'
    }] ${target?.name || '?'} to you`
  }

  private async renderChangeRoleNoti(noti: Notification) {
    const factor = await this.userRepo.findOne({
      where: { id: noti.factorIds[0] },
    })

    const role = await this.roleRepo.findOne({
      where: { id: In(noti.meta.roles as string[]) },
    })

    return `${factor?.name || 'A user'} has change your role to ${
      role?.name || '?'
    }`
  }
}
