import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Readable } from 'stream'
import { FileService } from './file.service'

@ApiTags('file')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':id')
  async getFileById(@Param('id', ParseUUIDPipe) id: string) {
    const file = await this.fileService.getFileById(id)
    const stream = Readable.from(file.data)

    return new StreamableFile(stream)
  }
}
