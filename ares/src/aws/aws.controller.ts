import { Body, Controller, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { AwsService } from './aws.service'
import { TFile } from './dto/upload.dto'

@Controller('aws')
@ApiSecurity('x-api-key')
@ApiTags('aws')
export class AwsController {
  constructor(private service: AwsService) {}

  @Post('s3')
  @ApiOperation({ summary: 'to upload file to aws' })
  @ApiBody({ isArray: true, type: TFile })
  uploadToS3(@Body() dto: Array<TFile>) {
    return this.service.uploadFile(dto)
  }
}
