import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { catchError, first, lastValueFrom, map, Observable } from 'rxjs'
import { Actions } from 'src/type/action'
import { Ownerful } from 'src/utils/owner.entity'
import { UserService } from '../user/user.service'
import { BaseEntity } from '../utils/base.entity'
import type { AxiosResponse } from 'axios'
import { PayloadService } from './payload.service'

@Injectable()
export class UtilService {
  constructor(
    private readonly userService: UserService,
    private readonly payloadService: PayloadService,
  ) {}

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
