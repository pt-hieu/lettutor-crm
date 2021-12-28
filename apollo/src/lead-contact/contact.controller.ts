import {
  Controller,
  Get,
  Query,
  Patch,
  ParseUUIDPipe,
  Param,
  Body,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { ContactService } from './contact.service'

@ApiTags('contact')
@ApiBearerAuth('jwt')
@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'view, search and filter all contacts' })
  @ApiQuery({ type: DTO.Contact.GetManyQuery })
  index(@Query() query: DTO.Contact.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Post()
  @ApiOperation({ summary: 'to add new contact manually' })
  addContact(@Body() dto: DTO.Contact.AddContact) {
    return this.service.addContact(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get contact information by Id' })
  getContactById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getContactById(
      {
        where: { id, isLead: false },
        relations: ['owner', 'account', 'deals', 'tasksOfContact'],
      },
      true,
    )
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to edit a contact' })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Contact.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }
}
