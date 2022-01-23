import { ApiProperty } from '@nestjs/swagger'
import { IsObject, IsString } from 'class-validator'

export class Bug {
  @ApiProperty()
  @IsString()
  event: string

  @ApiProperty()
  @IsString()
  model: string

  @ApiProperty()
  @IsObject()
  entry: {
    id: string
    subject: string
    email: string
    description: string
  }
}
