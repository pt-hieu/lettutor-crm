import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { Actions } from '../action'
import { Paginate } from './paging'

export class CreateRole {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ enum: Actions, enumName: 'Action', isArray: true })
  @IsArray()
  @IsEnum(Actions, { each: true })
  actions: Actions[]

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

  @ApiPropertyOptional({ enum: Actions, enumName: 'Action', isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Actions, { each: true })
  actions?: Actions[]

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsUUID(undefined, { each: true })
  // userIds?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  childrenIds?: string[]
}

export class GetManyRole extends Paginate { }
