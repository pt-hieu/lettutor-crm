import { ApiProperty } from '@nestjs/swagger'
import { Allow, IsEnum } from 'class-validator'

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

export class UploadAttachment extends Files {
  @ApiProperty({ type: 'enum', enumName: 'Entity', enum: Entity })
  @IsEnum(Entity)
  entity: Entity
}