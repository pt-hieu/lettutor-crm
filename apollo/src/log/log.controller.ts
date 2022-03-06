import { Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { LogInterceptor } from './log.interceptor'
import { LogService } from './log.service'

@Controller('log')
@ApiTags('log')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class LogController {
  constructor(private service: LogService) {}

  @Get()
  @UseInterceptors(LogInterceptor)
  @ApiOperation({ summary: 'to get many logs' })
  getMany(@Query() dto: DTO.Log.GetManyLogs) {
    return this.service.getMany(dto)
  }
}
