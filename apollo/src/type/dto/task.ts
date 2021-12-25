import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { TaskPriority, TaskStatus } from 'src/task/task.entity'
import { Double } from 'typeorm'
import { Paginate } from './paging'

export class AddTask {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contactId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  leadId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dealId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  subject: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ type: TaskPriority, enum: TaskPriority, isArray: true })
  @IsOptional()
  @IsEnum(TaskPriority, { each: true })
  priority?: TaskPriority[]

  @ApiPropertyOptional({ type: TaskStatus, enum: TaskStatus, isArray: true })
  @IsOptional()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[]
}
