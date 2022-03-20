import { ApiProperty } from '@nestjs/swagger'
import {
  Allow,
  IsEnum,
  IsNotEmpty,
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
