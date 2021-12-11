import {
  Controller,
  Get,
  Query,
  Patch,
  ParseUUIDPipe,
  Param,
  Body,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { ContactService } from './contact.service'

@ApiTags('contact')
@ApiBearerAuth('jwt')
@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) { }

  @Get()
  @ApiOperation({ summary: 'view, search and filter all contacts' })
  @ApiQuery({ type: DTO.Contact.GetManyQuery })
  index(@Query() query: DTO.Contact.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get contact information by Id' })
  getContactById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getContactById(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to edit a contact' })
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Contact.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }
}
