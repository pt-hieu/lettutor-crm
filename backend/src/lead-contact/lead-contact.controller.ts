import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { LeadContactService } from './lead-contact.service'

@ApiTags('lead-contact')
@ApiBearerAuth('jwt')
@Controller('lead-contact')
export class LeadContactController {
  constructor(private readonly service: LeadContactService) {}

  @Get('/:id')
  @ApiOperation({ summary: 'to get lead information by Id' })
  getLeadById(@Param('id') id: string) {
    return this.service.getLeadById(id)
  }

  @Post()
  @ApiOperation({ summary: 'to add new lead manually' })
  addLead(@Body() dto: DTO.LeadContact.AddLead) {
    return this.service.addLead(dto)
  }
}
