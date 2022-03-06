import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { AccountService } from './account.service'

@ApiTags('account')
@Controller('account')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'view and search all accounts' })
  @ApiQuery({ type: DTO.Account.GetManyQuery })
  index(@Query() query: DTO.Account.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get('/raw')
  @ApiOperation({ summary: 'to get raw accounts' })
  getManyRaw() {
    return this.service.getManyRaw()
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get account information by Id' })
  getAccountById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getAccountById(
      {
        where: { id },
        relations: [
          'owner',
          'contacts',
          'contacts.tasks',
          'contacts.tasks.owner',
          'deals',
          'deals.tasks',
          'deals.tasks.owner',
          'tasks',
          'tasks.owner',
          'notes',
          'notes.owner',
        ],
      },
      true,
    )
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_ACCOUNT)
  @ApiOperation({ summary: 'to add a new account manually' })
  addAccount(@Body() dto: DTO.Account.AddAccount) {
    return this.service.addAccount(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to edit a account' })
  updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Account.UpdateAccount,
  ) {
    return this.service.updateAccount(dto, id)
  }

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete accounts' })
  batchDelete(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
