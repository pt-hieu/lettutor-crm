import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { Public } from 'src/utils/decorators/public.decorator'
import { NoteService } from './note.service'

const MAX_COUNT_OF_FILES = 5
@ApiTags('note')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Post()
  @DefineAction(Actions.CREATE_NEW_NOTE)
  @ApiOperation({ summary: 'to add new note manually' })
  @UseInterceptors(FilesInterceptor('files', MAX_COUNT_OF_FILES))
  addNote(
    @Body() dto: DTO.Note.AddNote,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.service.addNote(dto, files)
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
