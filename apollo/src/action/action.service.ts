import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm'

import { Action } from './action.entity'
import { defaultActions } from './default.action'

@Injectable()
export class ActionService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Action) private actionRepo: Repository<Action>,
  ) {}

  async onApplicationBootstrap() {
    await this.initDefaultActions()
  }

  private async initDefaultActions() {
    if (process.env.NODE_ENV === 'production') return
    const actions = await this.actionRepo.find()
    if (actions.length > 0) return

    return this.actionRepo.upsert(defaultActions, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    })
  }

  getManyAction() {
    return this.actionRepo.find()
  }

  async getOneAction(option: FindOneOptions<Action>) {
    const action = await this.actionRepo.findOne(option)

    if (!action) {
      throw new NotFoundException(`Action not found`)
    }

    return action
  }
}
