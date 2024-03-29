import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'

import { Files } from './file'
import { Paginate } from './paging'

export enum FeedCategory {
  STATUS = 'Status',
  DEALS = 'Deals',
  TASKS = 'Tasks',
}

export enum TimeCategory {
  NOW = 'Now',
  YESTERDAY = 'Yesterday',
  LAST_WEEK = 'Last Week',
  CURRENT_MONTH = 'Current Month',
  LAST_MONTH = 'Last Month',
}

export class FeedFilter extends Paginate {
  @ApiProperty({ enum: FeedCategory })
  @IsEnum(FeedCategory)
  category: FeedCategory

  @ApiProperty({ enum: TimeCategory })
  @IsEnum(TimeCategory)
  time: TimeCategory
}

export class GetComment {
  @ApiProperty()
  @IsUUID()
  feedId: string

  @ApiProperty({ enum: FeedCategory })
  @IsEnum(FeedCategory)
  category: FeedCategory
}

export class AddStatus extends Files {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string
}

export class AddComment extends Files {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  statusId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  logId?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  content: string
}
