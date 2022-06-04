import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import moment from 'moment'
import { MoreThanOrEqual, Repository } from 'typeorm'

import { DTO } from 'src/type'

import { Notification } from './notification.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
  ) {}

  private async updateOldNoti(dto: DTO.Notification.Create) {
    const toUpdateNoti = await this.notiRepo.findOne({
      where: {
        targetId: dto.targetId,
        action: dto.action,
        userId: dto.userId,
        createdAt: MoreThanOrEqual(moment().subtract(2, 'days').toDate()),
      },
    })

    if (!toUpdateNoti) return null
    const factorIds = [
      ...new Set([...toUpdateNoti.factorIds, ...dto.factorIds]),
    ]

    return this.notiRepo.save({
      ...toUpdateNoti,
      factorIds,
      read: false,
    })
  }

  private async createNotification(dto: DTO.Notification.Create) {
    if (dto.factorIds.some((id) => id === dto.userId)) return

    const hasOldNotificationUpdated = await this.updateOldNoti(dto)
    if (hasOldNotificationUpdated) return hasOldNotificationUpdated

    return this.notiRepo.create(dto)
  }

  public createChangeRoleNoti(dto: DTO.Notification.CreateChangeRoleNoti) {
    return this.createNotification(dto)
  }

  public createAssignEntityNoti(dto: DTO.Notification.CreateAssignEntityNoti) {
    return this.createNotification(dto)
  }
}
