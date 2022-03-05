import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { Log } from './log.entity'

@Injectable()
export class LogService {
  constructor(@InjectRepository(Log) private logRepo: Repository<Log>) {}

  create(dto: DTO.Log.CreateLog) {
    return this.logRepo.save(dto)
  }
}
