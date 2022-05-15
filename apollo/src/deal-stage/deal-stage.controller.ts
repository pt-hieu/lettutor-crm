import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DefineAction } from 'src/action.decorator'
import { ActionType, DefaultActionTarget } from 'src/action/action.entity'
import { DTO } from 'src/type'

import { DealStageService } from './deal-stage.service'

@ApiTags('deal-stage')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('deal-stage')
export class DealStageController {
  constructor(private readonly service: DealStageService) {}

  @Get()
  @DefineAction({
    target: DefaultActionTarget.DEAL_STAGE,
    type: ActionType.CAN_VIEW_ALL,
  })
  @ApiOperation({ summary: 'view all deal stages' })
  index() {
    return this.service.getAll()
  }

  @Post()
  @DefineAction({
    target: DefaultActionTarget.DEAL_STAGE,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  })
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
