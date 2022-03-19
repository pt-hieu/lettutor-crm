import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { Double } from 'typeorm'

import { DealStageType } from 'src/deal-stage/deal-stage.entity'
import { LeadSource } from 'src/lead/lead.entity'

import { Paginate } from './paging'

export class AddDeal {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiProperty()
  @IsUUID()
  accountId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contactId?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  closingDate: Date

  @ApiProperty()
  @IsUUID()
  stageId: string

  @ApiPropertyOptional({
    type: LeadSource,
    enum: LeadSource,
    enumName: 'LeadSource',
  })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  probability?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}

export class ConvertToDeal {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  closingDate: Date

  @ApiProperty()
  @IsUUID()
  stageId: string
}

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  stage?: string[]

  @ApiPropertyOptional({ type: LeadSource, enum: LeadSource, isArray: true })
  @IsOptional()
  @IsEnum(LeadSource, { each: true })
  source?: LeadSource[]

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closeFrom?: Date

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closeTo?: Date
}

export class UpdateDeal {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contactId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closingDate?: Date

  @ApiProperty()
  @IsUUID()
  stageId: string

  @ApiPropertyOptional({
    type: LeadSource,
    enum: LeadSource,
    enumName: 'LeadSource',
  })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNumber()
  probability?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonForLoss?: string
}
