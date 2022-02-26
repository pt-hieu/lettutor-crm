import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
  StreamableFile,
} from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Readable } from 'stream'
import { Response } from 'express'
import { FileService } from './file.service'

@ApiTags('file')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':id')
  async getFileById(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.fileService.getFileById(id)

    const stream = Readable.from(file.data)

    // response.set({
    //   'Content-Disposition': `inline; filename="${file.filename}"`,
    //   'Content-Type': 'image',
    // })

    return new StreamableFile(stream)
  }
}
