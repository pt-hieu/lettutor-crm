import { ApiProperty } from '@nestjs/swagger'

export class UploadFiles {
  @ApiProperty()
  name: string

  @ApiProperty()
  buffer: string
}

export class DeleteFiles {
  @ApiProperty({ isArray: true, type: 'string' })
  keys: string[]
}
