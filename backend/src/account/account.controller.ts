import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiQuery } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { AccountService } from './account.service'

@Controller('account')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'view and search all accounts' })
  @ApiQuery({ type: DTO.Account.GetManyQuery })
  index(@Query() query: DTO.Account.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get account information by Id' })
  getAccountById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getAccountById({
      where: { id },
      relations: ['owner'],
    })
  }

  @Post()
  @ApiOperation({ summary: 'to add a new account manually' })
  addAccount(@Body() dto: DTO.Account.AddAccount) {
    return this.service.addAccount(dto)
  }
}
