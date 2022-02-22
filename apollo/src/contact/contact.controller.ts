import {
  Controller,
  Get,
  Query,
  Patch,
  ParseUUIDPipe,
  Param,
  Body,
  Post,
  Delete,
} from '@nestjs/common'
import { ApiOperation, ApiTags, ApiQuery, ApiSecurity } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { ContactService } from './contact.service'

@ApiTags('contact')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly service: ContactService,
    private readonly utilService: UtilService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'view, search and filter all contacts' })
  @ApiQuery({ type: DTO.Contact.GetManyQuery })
  index(@Query() query: DTO.Contact.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get('raw')
  @ApiOperation({ summary: 'get raw all contacts' })
  getManyRaw() {
    return this.service.getManyRaw()
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_CONTACT)
  @ApiOperation({ summary: 'to add new contact manually' })
  addContact(@Body() dto: DTO.Contact.AddContact) {
    return this.service.addContact(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get contact information by Id' })
  getContactById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getContactById(
      {
        where: { id },
        relations: ['owner', 'account', 'deals', 'tasks', 'tasks.owner', 'notes', 'notes.owner'],
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

  @Delete(':id')
  @ApiOperation({ summary: 'to soft delete a contact' })
  softDeleteContact(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.service.delete(id)
  }
}
