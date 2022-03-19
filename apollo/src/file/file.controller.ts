import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'

import { Files, UploadAttachment } from 'src/type/dto/file'

import { FileService } from './file.service'

@ApiTags('file')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('attachment/:entityId')
  createAttachment(
    @Body() dto: UploadAttachment,
    @Param('entityId', ParseUUIDPipe) id: string,
  ) {
    return this.fileService.createEntityAttachments(id, dto)
  }

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete one or many attachments' })
  deleteNote(@Body() dto: DTO.BatchDelete) {
    return this.fileService.removeEntityAttachments(dto.ids)
  }
}
