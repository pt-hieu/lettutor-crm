import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { LeadStatus, LeadSource } from 'src/lead-contact/lead-contact.entity'
import { Paginate } from './paging'

export class AddLead {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  ownerId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(LeadStatus)
  status: LeadStatus

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(LeadSource)
  source: LeadSource

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

export class GetManyQuery extends Paginate{
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ enum: LeadStatus, enumName: 'Lead Status' })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus

  @ApiPropertyOptional({ enum: LeadSource, enumName: 'Lead Source' })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource
}