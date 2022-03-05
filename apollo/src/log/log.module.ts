import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LogController } from './log.controller'
import { Log } from './log.entity'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LogController],
  providers: [LogService, LogListener],
})
export class LogModule {}
