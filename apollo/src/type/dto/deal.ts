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
import { DealStage } from 'src/deal/deal.entity'
import { LeadSource } from 'src/lead/lead.entity'
import { Task } from 'src/task/task.entity'
import { Double } from 'typeorm'
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

  @IsOptional()
  tasks?: Task[]
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage

  @ApiPropertyOptional()
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
}
