import { Module } from '@nestjs/common'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  providers: [LogService, LogListener],
})
export class LogModule {}
