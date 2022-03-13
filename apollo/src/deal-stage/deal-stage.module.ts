import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DealStageController } from './deal-stage.controller'
import { DealStage } from './deal-stage.entity'
import { DealStageService } from './deal-stage.service'

@Module({
  imports: [TypeOrmModule.forFeature([DealStage])],
  controllers: [DealStageController],
  providers: [DealStageService],
  exports: [DealStageService],
})
export class DealStageModule {}
