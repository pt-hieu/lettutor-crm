import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DTO } from 'src/type'
import { LogService } from './log.service'

@Injectable()
export class LogListener {
  constructor(private service: LogService) {}

  @OnEvent('log.created', { async: true })
  createLog(dto: DTO.Log.CreateLog) {
    return this.service.create(dto)
  }
}
