import { Body, Controller, Delete, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { AwsService } from './aws.service'
import { DeleteFiles, UploadFiles } from './dto/s3.dto'

@Controller('aws')
@ApiSecurity('x-api-key')
@ApiTags('aws')
export class AwsController {
  constructor(private service: AwsService) {}

  @Post('s3')
  @ApiOperation({ summary: 'to upload file to aws s3' })
  @ApiBody({ isArray: true, type: UploadFiles })
  uploadToS3(@Body() dto: Array<UploadFiles>) {
    return this.service.uploadFile(dto)
  }

  @Delete('s3')
  @ApiOperation({ summary: 'to delete file in aws s3' })
  deleteInS3(@Body() dto: DeleteFiles) {
    return this.service.deleteFile(dto.keys)
  }
}
