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

import { DealStageType } from 'src/deal-stage/deal-stage.entity'

export enum DealStageAction {
  ADD = 'Add',
  DELETE = 'Delete',
  UPDATE = 'Update',
}

export class ModifyDealStage {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ type: Double })
  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number

  @ApiProperty()
  @IsEnum(DealStageType)
  type: DealStageType

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DealStageAction)
  action?: DealStageAction

  order: number
}

export class ExposeDto {
  @ApiProperty()
  @Allow()
  items: ModifyDealStage[]
}
