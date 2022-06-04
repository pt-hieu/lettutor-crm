import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { AxiosResponse } from 'axios'
import { Observable, catchError, first, lastValueFrom, map } from 'rxjs'

import { ActionType, DefaultActionTarget } from 'src/action/action.entity'
import { TChange } from 'src/log/log.entity'
import { Entity } from 'src/module/module.entity'
import { DTO } from 'src/type'
import { Ownerful } from 'src/utils/owner.entity'

import { UserService } from '../user/user.service'
import { BaseEntity } from '../utils/base.entity'
import { PayloadService } from './payload.service'

@Injectable()
export class UtilService {
  public aresService: string
  private keysToIgnore = [
    'id',
    'createdAt',
    'createdById',
    'updatedAt',
    'updatedById',
    'deletedAt',
    'ownerId',
    'attachments',
  ]

  constructor(
    private readonly userService: UserService,
    private readonly payloadService: PayloadService,
    private eventEmitter: EventEmitter2,
  ) {
    this.aresService = process.env.ARES_SERVICE
  }

  public wrap<T>($obs: Observable<AxiosResponse<T>>) {
    return lastValueFrom(
      $obs.pipe(
        map((res) => res.data),
        first(),
        catchError((e) => {
          if (e.code) {
            throw new InternalServerErrorException(e.code)
          }

          throw new HttpException(e.response.data, e.response.status)
        }),
      ),
    )
  }

  public compare(
    baseEntity: object,
    entityToCompare: object,
    ignoreKeys?: string[],
  ) {
    const changes: TChange[] = []
    Object.entries(baseEntity).forEach(([key, value]) => {
      if (this.keysToIgnore.includes(key)) return
      if (ignoreKeys?.includes(key)) return
      if (typeof entityToCompare[key] === 'object') return

      if (baseEntity[key] === entityToCompare[key]) return

      changes.push({ name: key, from: value, to: entityToCompare[key] })
    })

    return changes
  }

  public emitLog(dto: DTO.Log.CreateLog) {
    if (!dto.entityId) return
    this.eventEmitter.emit('log.created', dto)
  }

  public async loadTraceInfo(entity: BaseEntity) {
    const [createdBy, updatedBy] = await Promise.allSettled([
      entity.createdById
        ? this.userService.getOneUserById({
            where: { id: entity.createdById },
          })
        : undefined,
      entity.updatedById
        ? this.userService.getOneUserById({
            where: { id: entity.updatedById },
          })
        : undefined,
    ])

    entity.updatedBy =
      updatedBy?.status === 'rejected' ? null : updatedBy?.value
    entity.createdBy =
      createdBy?.status === 'rejected' ? null : createdBy?.value
  }

  public checkOwnership(entity: Ownerful) {
    return entity.ownerId === this.payloadService.data.id
  }

  public checkOwnershipEntity(entity: Entity) {
    return entity.data['ownerId'] === this.payloadService.data.id
  }

  public checkRoleAction(
    ...requiredActions: { target: string; type: ActionType }[]
  ) {
    if (!this.payloadService.data) return false

    return !!requiredActions.filter((requiredAction) =>
      this.payloadService.data.roles.some(({ actions }) =>
        actions.some(
          ({ type, target }) =>
            (target === requiredAction.target &&
              type === requiredAction.type) ||
            (target === DefaultActionTarget.ADMIN &&
              type === ActionType.IS_ADMIN),
        ),
      ),
    ).length
  }
}
