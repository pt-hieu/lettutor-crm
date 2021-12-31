import {
  Body,
  Controller,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { NoteService } from './note.service'

@ApiTags('note')
@ApiBearerAuth('jwt')
@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) { }

  @Post()
  @ApiOperation({ summary: 'to add new note manually' })
  addNote(@Body() dto: DTO.Note.AddNote) {
    return this.service.addNote(dto)
  }
}
