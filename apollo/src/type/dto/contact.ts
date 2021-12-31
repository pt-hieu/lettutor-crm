import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsMobilePhone,
} from 'class-validator'
import { LeadSource } from 'src/lead/lead.entity'
import { Paginate } from './paging'

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ type: LeadSource, enum: LeadSource, isArray: true })
  @IsOptional()
  @IsEnum(LeadSource, { each: true })
  source?: LeadSource[]
}

export class UpdateBody {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  socialAccount?: string
}

export class AddContact {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiProperty()
  @IsEmail()
  @MaxLength(100)
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  socialAccount?: string
}
