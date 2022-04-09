import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  Allow,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'

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
  description?: string

  @ApiPropertyOptional()
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
