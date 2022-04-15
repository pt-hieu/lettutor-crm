import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { ActionService } from './action.service'

@Controller('action')
@ApiTags('action')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class ActionController {
  constructor(private service: ActionService) {}

  @Get()
  @ApiOperation({ summary: 'to get many actions' })
  getModule() {
    return this.service.getManyAction()
  }
}
