import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator'

import { Entity } from '../util'

export class Files {
  @ApiProperty()
  @Allow()
  files: [
    {
      name: string
      buffer: string
    },
  ]
}

export class UploadExternalAttachment {
  @ApiProperty({ type: 'enum', enumName: 'Entity', enum: Entity })
  @IsEnum(Entity)
  entity: Entity

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  key: string

  @ApiProperty()
  @IsUrl()
  location: string
}

export class UploadAttachment extends Files {
  @ApiProperty({ type: 'enum', enumName: 'Entity', enum: Entity })
  @IsEnum(Entity)
  entity: Entity
}

export class UpdateAttachment {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  @IsString()
  key?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  location?: string
}
