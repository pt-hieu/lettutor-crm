import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from 'src/role.decorator'
import { DTO } from 'src/type'
import { Role } from 'src/user/user.entity'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { JwtPayload } from 'src/utils/interface'
import { LeadContactService } from './lead-contact.service'

@ApiTags('lead-contact')
@ApiBearerAuth('jwt')
@Controller('lead-contact')
export class LeadContactController {
  constructor(private readonly service: LeadContactService) {}

  @Post()
  @ApiOperation({ summary: 'to add new lead manually' })
  addLead(@Body() dto: DTO.LeadContact.AddLead) {
    return this.service.addLead(dto)
  }
}
