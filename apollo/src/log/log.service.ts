import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Note } from 'src/note/note.entity'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'

@Injectable()
export class LogService {
  constructor(@InjectRepository(Note) private noteRepo: Repository<Note>) {}

  create(dto: DTO.Log.CreateLog) {
    return this.noteRepo.save(dto)
  }
}
