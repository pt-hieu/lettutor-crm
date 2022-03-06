import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DTO } from 'src/type'
import { LogAction } from './log.entity'
import { LogService } from './log.service'

@Injectable()
export class LogListener {
  constructor(private service: LogService) {}

  @OnEvent('log.created', { async: true })
  async createLog(dto: DTO.Log.CreateLog) {
    if (dto.action === LogAction.DELETE) {
      await this.service.updateDeleteEntity(dto.entityId)
    }

    return this.service.create(dto)
  }
}
