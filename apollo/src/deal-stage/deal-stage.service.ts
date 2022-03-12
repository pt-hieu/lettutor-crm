import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { DealStage } from './deal-stage.entity'

@Injectable()
export class DealStageService {
  constructor(
    @InjectRepository(DealStage)
    private dealStageRepo: Repository<DealStage>,
  ) {}
}
