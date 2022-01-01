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
import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { ContactService } from './contact.service'

@ApiTags('contact')
@ApiBearerAuth('jwt')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly service: ContactService,
    private readonly utilService: UtilService,
  ) {}

  @Get()
  @DefineAction(Actions.VIEW_ALL_CONTACTS)
  @ApiOperation({ summary: 'view, search and filter all contacts' })
  @ApiQuery({ type: DTO.Contact.GetManyQuery })
  index(@Query() query: DTO.Contact.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_CONTACT)
  @ApiOperation({ summary: 'to add new contact manually' })
  addContact(@Body() dto: DTO.Contact.AddContact) {
    return this.service.addContact(dto)
  }

  @Get(':id')
  @DefineAction(Actions.VIEW_ALL_CONTACT_DETAILS)
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_CONTACT_DETAILS)
  @ApiOperation({ summary: 'to get contact information by Id' })
  getContactById(@Param('id', ParseUUIDPipe) id: string) {
    const relations = ['owner', 'account', 'deals']

    if (this.utilService.checkRoleAction([Actions.VIEW_ALL_TASKS])) {
      relations.push('tasks', 'tasks.owner')
    }

    return this.service.getContactById(
      {
        where: { id },
        relations,
      },
      true,
    )
  }

  @Patch(':id')
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_CONTACT_DETAILS)
  @ApiOperation({ summary: 'to edit a contact' })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Contact.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }
}
