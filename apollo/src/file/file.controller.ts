import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
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
  @ApiOperation({ summary: 'to create an external attachment' })
  createExternalAttachment(
    @Body() dto: DTO.File.UploadExternalAttachment,
    @Param('entityId', ParseUUIDPipe) id: string,
  ) {
    return this.fileService.createEntityExternalAttachment(id, dto)
  }

  @Patch('attachment/external/:id')
  @ApiOperation({ summary: 'to update an external attachment' })
  updateExternalAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.File.UpdateAttachment,
  ) {
    return this.fileService.updateExternalAttachment(id, dto)
  }

  @Post('attachment/:entityId')
  createAttachment(
    @Body() dto: DTO.File.Files,
    @Param('entityId', ParseUUIDPipe) id: string,
  ) {
    return this.fileService.createEntityAttachments(id, dto)
  }
}
