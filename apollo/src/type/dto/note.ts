import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'

export class AddNote {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dealId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  content?: string
}
