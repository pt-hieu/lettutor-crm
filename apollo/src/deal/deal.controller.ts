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
  @ApiOperation({ summary: 'to get deal information by Id' })
  getDealById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getDealById(
      {
        where: { id },
        relations: [
          'owner',
          'account',
          'contact',
          'tasks',
          'tasks.owner',
          'notes',
        ],
      },
      true,
    )
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to update deal manually' })
  updateDeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Deal.UpdateDeal,
  ) {
    return this.service.updateDeal(dto, id)
  }
}
