import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { Public } from 'src/utils/decorators/public.decorator'
import { NoteService } from './note.service'

@ApiTags('note')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) { }

  @Post()
  @DefineAction(Actions.CREATE_NEW_NOTE)
  @ApiOperation({ summary: 'to add new note manually' })
  addNote(@Body() dto: DTO.Note.AddNote) {
    return this.service.addNote(dto)
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'to view, search and filter all notes' })
  index(@Query() query: DTO.Note.GetManyQuery) {
    return this.service.getMany(query)
  }
}
