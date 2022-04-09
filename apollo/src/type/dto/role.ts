import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

import { Paginate } from './paging'

export class CreateRole {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  actionsId?: string[]

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsUUID(undefined, { each: true })
  // userIds?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  childrenIds?: string[]
}

export class UpdateRole {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  actionsId?: string[]

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsUUID(undefined, { each: true })
  // userIds?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  childrenIds?: string[]
}

export class GetManyRole extends Paginate {}
