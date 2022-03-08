import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'

import { DealService } from './deal.service'

@ApiTags('deal')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('deal')
export class DealController {
  constructor(
    private readonly service: DealService,
    private readonly utilService: UtilService,
  ) {}

  @Get('raw')
  @ApiOperation({ summary: 'to view raw all deals' })
  getManyRaw() {
    return this.service.getManyRaw()
  }

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
          'notes.owner',
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

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete deals' })
  batchDelete(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
