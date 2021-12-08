import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { ContactService } from './contact.service'

@ApiTags('contact')
@ApiBearerAuth('jwt')
@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) { }

  @Get()
  @ApiOperation({ summary: 'view, search and filter all contacts' })
  index(@Query() query: DTO.LeadContact.GetManyQuery) {
    return this.service.getMany(query)
  }
}
