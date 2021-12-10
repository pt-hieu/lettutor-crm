import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { DealService } from './deal.service'

@ApiTags('deal')
@ApiBearerAuth('jwt')
@Controller('deal')
export class DealController {
  constructor(private readonly service: DealService) {}

  @Get()
  @ApiOperation({ summary: 'view, search and filter all deal' })
  @ApiQuery({ type: DTO.Deal.GetManyQuery })
  index(@Query() query: DTO.Deal.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to update deal manually' })
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Deal.UpdateDeal,
  ) {
    return this.service.updateDeal(dto, id)
  }
}
