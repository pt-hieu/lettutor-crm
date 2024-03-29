import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator'

import { LogAction, LogSource, TChange } from 'src/log/log.entity'
import { EntityValidator } from 'src/utils/decorators/log_entity.validator'

import { Paginate } from './paging'

export class CreateLog {
  source: LogSource | string
  action: LogAction
  changes: TChange[] | null
  ownerId: string | null
  entityId: string
  entityName: string
}

export class GetManyLogs extends Paginate {
  @ApiPropertyOptional({ enum: LogSource, isArray: true })
  @IsOptional()
  source?: LogSource | string

  @ApiPropertyOptional({ enum: LogAction })
  @IsOptional()
  @IsEnum(LogAction)
  action?: LogAction

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  from?: Date

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  to?: Date

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  property?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  owner?: string

  @ApiPropertyOptional()
  @Validate(EntityValidator)
  @IsOptional()
  entity?: string
}
