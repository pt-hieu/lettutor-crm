import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Log } from './log.entity'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogService, LogListener],
})
export class LogModule {}
