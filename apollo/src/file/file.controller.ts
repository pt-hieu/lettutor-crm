import { Controller } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { FileService } from './file.service'

@ApiTags('file')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
}
