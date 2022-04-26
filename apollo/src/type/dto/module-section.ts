import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'

export enum SectionAction {
  ADD = 'Add',
  DELETE = 'Delete',
  UPDATE = 'Update',
}

export class ModifySection {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  moduleId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SectionAction)
  action?: SectionAction

  order: number
}

export class ExposeDto {
  @ApiProperty()
  @Allow()
  items: ModifySection[]
}
