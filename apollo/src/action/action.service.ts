import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import { Action } from './action.entity'
import { defaultActions } from './default.action'

@Injectable()
export class ActionService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Action) private actionRepo: Repository<Action>,
  ) {}

  async onApplicationBootstrap() {
    this.initDefaultModules()
  }

  private initDefaultModules() {
    if (process.env.NODE_ENV === 'production') return

    return this.actionRepo.upsert(defaultActions, {
      conflictPaths: ['type', 'target'],
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
