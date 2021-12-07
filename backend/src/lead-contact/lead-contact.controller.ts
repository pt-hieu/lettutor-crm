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
import { LeadContactService } from './lead-contact.service'

@ApiTags('lead-contact')
@ApiBearerAuth('jwt')
@Controller('lead-contact')
export class LeadContactController {
  constructor(private readonly service: LeadContactService) {}

  @Get()
  @ApiOperation({ summary: 'view, search and filter all leads or contacts' })
  index(@Query() query: DTO.LeadContact.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get lead information by Id' })
  getLeadById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getLeadById(id)
  }

  @Post()
  @ApiOperation({ summary: 'to add new lead manually' })
  addLead(@Body() dto: DTO.LeadContact.AddLead) {
    return this.service.addLead(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to upate lead manually' })
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.LeadContact.UpdateLead,
  ) {
    return this.service.updateLead(dto, id)
  }

  @Get(':id/convert-to-account')
  @ApiOperation({ summary: 'to convert lead to account' })
  convertToAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.convertToAccount(id)
  }
}
