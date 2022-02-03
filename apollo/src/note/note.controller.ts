import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { NoteService } from './note.service'

@ApiTags('note')
@ApiSecurity('x-api-key')
@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Post()
  @DefineAction(Actions.CREATE_NEW_NOTE)
  @ApiOperation({ summary: 'to add new note manually' })
  addNote(@Body() dto: DTO.Note.AddNote) {
    return this.service.addNote(dto)
  }
}
