import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { DealService } from './deal.service'

@ApiTags('deal')
@ApiBearerAuth('jwt')
@Controller('deal')
export class DealController {
  constructor(
    private readonly service: DealService,
    private readonly utilService: UtilService,
  ) {}

  @Get()
  @DefineAction(Actions.VIEW_ALL_DEALS)
  @ApiOperation({ summary: 'view, search and filter all deal' })
  @ApiQuery({ type: DTO.Deal.GetManyQuery })
  index(@Query() query: DTO.Deal.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_DEAL)
  @ApiOperation({ summary: 'to add new deal manually' })
  addDeal(@Body() dto: DTO.Deal.AddDeal) {
    return this.service.addDeal(dto)
  }

  @Get(':id')
  @DefineAction(Actions.VIEW_ALL_DEAL_DETAILS)
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_DEAL_DETAILS)
  @ApiOperation({ summary: 'to get deal information by Id' })
  getDealById(@Param('id', ParseUUIDPipe) id: string) {
    const relations = ['owner', 'account', 'contact']

    if (this.utilService.checkRoleAction([Actions.VIEW_ALL_TASKS])) {
      relations.push('tasks', 'tasks.owner')
    }

    if (this.utilService.checkRoleAction([Actions.VIEW_ALL_NOTES])) {
      relations.push('notes')
    }

    return this.service.getDealById(
      {
        where: { id },
        relations,
      },
      true,
    )
  }

  @Patch(':id')
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_DEAL_DETAILS)
  @ApiOperation({ summary: 'to update deal manually' })
  updateDeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Deal.UpdateDeal,
  ) {
    return this.service.updateDeal(dto, id)
  }
}
