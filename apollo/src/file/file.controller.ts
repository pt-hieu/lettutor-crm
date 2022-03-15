import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'

import { Files } from 'src/type/dto/file'

import { FileService } from './file.service'

@ApiTags('file')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('attachment/:entityId')
  createAttachment(
    @Body() dto: Files,
    @Param('entityId', ParseUUIDPipe) id: string,
  ) {
    return this.fileService.createEntityAttachments(id, dto.files)
  }
}
