import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
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
  @IsObject()
  data: Record<string, unknown>
}

export class GetManyEntity extends Paginate {}
