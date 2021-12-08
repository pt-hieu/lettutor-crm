import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { LeadService } from './lead.service'

@ApiTags('lead')
@ApiBearerAuth('jwt')
@Controller('lead')
export class LeadController {
  constructor(private readonly service: LeadService) {}

  @Get()
  @ApiOperation({ summary: 'view, search and filter all leads' })
  index(@Query() query: DTO.Lead.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get lead information by Id' })
  getLeadById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getLeadById(id)
  }

  @Post()
  @ApiOperation({ summary: 'to add new lead manually' })
  addLead(@Body() dto: DTO.Lead.AddLead) {
    return this.service.addLead(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to upate lead manually' })
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Lead.UpdateLead,
  ) {
    return this.service.updateLead(dto, id)
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'to convert lead to account, contact and lead' })
  convertToAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.convertToAccountAndContact(id)
  }
}
