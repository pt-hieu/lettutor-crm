import { Controller } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DealStageService } from './deal-stage.service'

@ApiTags('deal-stage')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('deal-stage')
export class DealStageController {
  constructor(private readonly service: DealStageService) {}
}
