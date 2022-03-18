import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator'

import { LinkSource } from 'src/link/link.entity'

import { Paginate } from './paging'

export class AddLink {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiProperty()
  @IsUrl()
  url: string

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty()
  @IsEnum(LinkSource)
  source: LinkSource

  @ApiProperty()
  @IsUUID()
  entityId: string
}

export class UpdateLink {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string
}

export class GetManyLinks extends Paginate {
  @ApiPropertyOptional({ enum: LinkSource })
  @IsOptional()
  @IsEnum(LinkSource)
  source?: LinkSource

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  owner?: string

  @ApiPropertyOptional()
  @IsOptional()
  entity?: string
}
