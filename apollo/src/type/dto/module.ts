import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { Double } from 'typeorm'

import { FieldMeta } from 'src/module/module.entity'

import { Paginate } from './paging'

export class CreateModule {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  description?: string
}

export class UpdateModule {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  meta: FieldMeta[]
}

export class AddEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsObject()
  data: Record<string, unknown>
}

export class UpdateEnity {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>
}

export class GetManyEntity extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string
}

export class ConvertToDeal {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

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
