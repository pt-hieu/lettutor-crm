import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { DealStage } from 'src/deal/deal.entity'
import { LeadSource } from 'src/lead-contact/lead-contact.entity'
import { Double } from 'typeorm'
import { Paginate } from './paging'

export class AddDeal {
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
  closingDate?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage

  @ApiPropertyOptional()
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

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ type: DealStage, enum: DealStage, isArray: true })
  @IsOptional()
  @IsEnum(DealStage, { each: true })
  stage?: DealStage[]

  @ApiPropertyOptional({ type: LeadSource, enum: LeadSource, isArray: true })
  @IsOptional()
  @IsEnum(LeadSource, { each: true })
  source?: LeadSource[]
}

export class UpdateDeal {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string

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
  closingDate?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage

  @ApiPropertyOptional()
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
