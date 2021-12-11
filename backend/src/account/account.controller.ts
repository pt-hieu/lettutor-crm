import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DTO } from 'src/type';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly service: AccountService) { }

  @Get()
  @ApiOperation({ summary: 'view and search all accounts' })
  @ApiQuery({ type: DTO.Account.GetManyQuery })
  index(@Query() query: DTO.Account.GetManyQuery) {
    return this.service.getMany(query)
  }
  
  @Post()
  @ApiOperation({ summary: 'to add a new account manually' })
  addLead(@Body() dto: DTO.Account.AddAccount) {
    return this.service.addAccount(dto)
  }
}
