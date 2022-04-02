import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'

import { DealStageService } from './deal-stage.service'

@ApiTags('deal-stage')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('deal-stage')
export class DealStageController {
  constructor(private readonly service: DealStageService) {}

  @Get()
  @DefineAction(Actions.VIEW_ALL_DEAL_STAGES)
  @ApiOperation({ summary: 'view all deal stages' })
  index() {
    return this.service.getAll()
  }

  @Post()
  @DefineAction(Actions.MODIFY_ALL_DEAL_STAGES)
  @ApiOperation({ summary: 'to modify all deal stages' })
  addDeal(
    @Body()
    dto: DTO.DealStage.ExposeDto,
  ) {
    return this.service.modifyDealStage(dto.items)
  }

  @Get('raw')
  @ApiOperation({ summary: 'to get raw deal stage' })
  getRaw() {
    return this.service.getRaw()
  }
}
