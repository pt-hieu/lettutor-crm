import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { LogAction, LogSource, TChange } from 'src/log/log.entity'
import { Paginate } from './paging'

export class CreateLog {
  source: LogSource
  action: LogAction
  changes: TChange[] | null
  ownerId: string
  entityId: string
  entityName: string
}

export class GetManyLogs extends Paginate {
  @ApiPropertyOptional({ enum: LogSource })
  @IsOptional()
  @IsEnum(LogSource)
  source?: LogSource

  @ApiPropertyOptional({ enum: LogAction })
  @IsOptional()
  @IsEnum(LogAction)
  action?: LogAction

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  from?: Date

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @IsOptional()
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
  @IsOptional()
  @IsUUID()
  entity?: string
}
