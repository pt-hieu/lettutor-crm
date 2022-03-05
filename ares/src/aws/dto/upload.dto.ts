import { ApiProperty } from '@nestjs/swagger'

export class TFile {
  @ApiProperty()
  name: string

  @ApiProperty()
  buffer: string
}
