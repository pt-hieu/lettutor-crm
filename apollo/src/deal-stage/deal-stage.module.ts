import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ModuleModule } from 'src/module/module.module'

import { DealStageController } from './deal-stage.controller'
import { DealStage } from './deal-stage.entity'
import { DealStageService } from './deal-stage.service'

@Module({
  imports: [TypeOrmModule.forFeature([DealStage]), ModuleModule],
  controllers: [DealStageController],
  providers: [DealStageService],
  exports: [DealStageService],
})
export class DealStageModule {}
