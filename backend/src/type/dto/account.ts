import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { AccountType } from 'src/account/account.entity'
import { Paginate } from './paging'

export class AddAccount {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsMobilePhone()
  phoneNum?: string
}

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string
}
