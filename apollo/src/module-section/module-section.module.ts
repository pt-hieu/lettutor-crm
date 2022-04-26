import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ModuleModule } from 'src/module/module.module'

import { SectionController } from './module-section.controller'
import { Section } from './module-section.entity'
import { SectionService } from './module-section.service'
import { SectionSubscriber } from './module-section.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Section]), ModuleModule],
  providers: [SectionService, SectionSubscriber],
  controllers: [SectionController],
  exports: [SectionService],
})
export class SectionModule {}
