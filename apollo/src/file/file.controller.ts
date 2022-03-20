import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DTO } from 'src/type'

import { FileService } from './file.service'

@ApiTags('file')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete attachments' })
  deleteFile(@Body() dto: DTO.BatchDelete) {
    return this.fileService.removeEntityAttachments(dto.ids)
  }

  @Post('attachment/external/:entityId')
  createExternalAttachment(
    @Body() dto: DTO.File.UploadExternalAttachment,
    @Param('entityId', ParseUUIDPipe) id: string,
  ) {
    return this.fileService.createEntityExternalAttachment(id, dto)
  }

  @Post('attachment/:entityId')
  createAttachment(
    @Body() dto: DTO.File.UploadAttachment,
    @Param('entityId', ParseUUIDPipe) id: string,
  ) {
    return this.fileService.createEntityAttachments(id, dto)
  }
}
