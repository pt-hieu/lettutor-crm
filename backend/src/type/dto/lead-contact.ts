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
  IsArray
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

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ type: LeadStatus, enum: LeadStatus, isArray: true })
  @IsOptional()
  status?: LeadStatus[]

  @ApiPropertyOptional({ type: LeadSource, enum: LeadSource, isArray: true })
  @IsOptional()
  @IsArray()
  sources?: LeadSource[]
}