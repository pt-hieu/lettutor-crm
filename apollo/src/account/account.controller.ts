import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { AccountService } from './account.service'

@ApiTags('account')
@ApiBearerAuth('jwt')
@Controller('account')
export class AccountController {
  constructor(
    private readonly service: AccountService,
    private readonly utilService: UtilService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'view and search all accounts' })
  @ApiQuery({ type: DTO.Account.GetManyQuery })
  index(@Query() query: DTO.Account.GetManyQuery) {
    return this.service.getMany(query)
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
}
