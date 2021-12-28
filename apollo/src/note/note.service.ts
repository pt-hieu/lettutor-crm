import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DealService } from 'src/deal/deal.service'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import { Repository } from 'typeorm'
import { Note } from './note.entity'

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => DealService))
    private readonly dealService: DealService,
  ) {}

  async addNote(dto: DTO.Note.AddNote) {
    await Promise.all([
      dto.dealId
        ? this.dealService.getDealById({ where: { id: dto.dealId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
    ])

    return this.noteRepo.save(dto)
  }
}
