import { ApiProperty } from '@nestjs/swagger'
import { Allow } from 'class-validator'

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
