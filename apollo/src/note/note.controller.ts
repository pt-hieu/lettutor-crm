import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DefineAction } from 'src/action.decorator'
import { ActionType, DefaultActionTarget } from 'src/action/action.entity'
import { DTO } from 'src/type'

import { NoteService } from './note.service'

const MAX_COUNT_OF_FILES = 5
@ApiTags('note')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Post()
  @DefineAction({
    target: DefaultActionTarget.NOTE,
    type: ActionType.CAN_CREATE_NEW,
  })
  @ApiOperation({ summary: 'to add new note manually' })
  addNote(@Body() dto: DTO.Note.AddNote) {
    if (dto.files.length > MAX_COUNT_OF_FILES) {
      throw new BadRequestException('The number of file exceeds the limitation')
    }

    return this.service.addNote(dto)
  }

  @Get()
  @ApiOperation({ summary: 'to view, search and filter all notes' })
  index(@Query() query: DTO.Note.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get note information by Id' })
  getNoteById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getNoteById({
      where: { id },
      relations: ['owner', 'account', 'lead', 'contact', 'deal'],
    })
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to edit a note' })
  updateNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Note.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete a note' })
  deleteNote(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
