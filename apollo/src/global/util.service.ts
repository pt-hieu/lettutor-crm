import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { AxiosResponse } from 'axios'
import { Observable, catchError, first, lastValueFrom, map } from 'rxjs'

import { TChange } from 'src/log/log.entity'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
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
    oldName?: string,
    nameToCompare?: string,
  ) {
    const changes: TChange[] = []

    if (oldName !== nameToCompare) {
      changes.push({ name: 'name', from: oldName, to: nameToCompare })
    }
    Object.entries(baseEntity).forEach(([key, value]) => {
      if (this.keysToIgnore.includes(key)) return
      if (baseEntity[key] === entityToCompare[key]) return

      changes.push({ name: key, from: value, to: entityToCompare[key] })
    })

    return changes
  }

  public emitLog(dto: DTO.Log.CreateLog) {
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

  public checkRoleAction(...requiredActions: Actions[]) {
    if (!this.payloadService.data) return false

    return !!requiredActions.filter((action) =>
      this.payloadService.data.roles.some(
        (role) =>
          role.actions.includes(action) ||
          role.actions.includes(Actions.IS_ADMIN),
      ),
    ).length
  }
}
