import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { Double } from 'typeorm'

import { DealStageCategory } from 'src/deal-stage/deal-stage.entity'

export enum DealStageAction {
  ADD = 'Add',
  DELETE = 'Delete',
  UPDATE = 'Update',
}

export class BatchDelete {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  ids: string[]
}

export class ModifyDealStage extends BatchDelete {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ type: Double })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DealStageCategory)
  category: DealStageCategory

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DealStageAction)
  action?: DealStageAction

  order: number
}

export class ExposeDto {
  @ApiProperty()
  @Allow()
  items: [ModifyDealStage]
}
