import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import moment from 'moment'
import { paginate } from 'nestjs-typeorm-paginate'
import { MoreThanOrEqual, Repository } from 'typeorm'

import { DTO } from 'src/type'

import { Notification } from './notification.entity'
import { RenderService } from './render.service'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
    private renderService: RenderService,
  ) {}

  private async updateOldNoti(dto: DTO.Notification.CreateNotification) {
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

  async getMany(
    userId: string,
    { limit, page, shouldNotPaginate }: DTO.Notification.GetManyNotification,
  ) {
    const qb = this.notiRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .addOrderBy('n.read', 'ASC')
      .addOrderBy('n.updatedAt', 'DESC')

    if (shouldNotPaginate)
      return (await qb.getMany()).map((n) => ({
        ...n,
        message: this.renderService.renderNotification(n),
      }))

    const result = await paginate(qb, { limit, page })

    return {
      items: result.items.map((item) => ({
        ...item,
        message: this.renderService.renderNotification(item),
      })),
      meta: result.meta,
    }
  }

  async toggleRead(userId: string, notiId: string, value: boolean) {
    const noti = await this.notiRepo.findOne({ where: { userId, id: notiId } })
    if (!noti) throw new NotFoundException('Noti not found')

    return this.notiRepo.save({
      ...noti,
      read: value,
    })
  }

  private async createNotification(dto: DTO.Notification.CreateNotification) {
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
