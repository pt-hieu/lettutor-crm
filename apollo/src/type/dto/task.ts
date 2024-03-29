import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'

import { TaskPriority, TaskStatus } from 'src/task/task.entity'

import { Paginate } from './paging'

export class AddTask {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiPropertyOptional({ enum: TaskPriority, enumName: 'Task Priority' })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @ApiPropertyOptional({ enum: TaskStatus, enumName: 'Task Status' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiProperty()
  @IsUUID(undefined, { each: true })
  entityIds: string[]
}

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    type: TaskPriority,
    enum: TaskPriority,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { each: true })
  @Transform(({ value }) => [value].flat())
  priority?: TaskPriority[]

  @ApiPropertyOptional({ type: TaskStatus, enum: TaskStatus, isArray: true })
  @IsOptional()
  @IsEnum(TaskStatus, { each: true })
  @Transform(({ value }) => [value].flat())
  status?: TaskStatus[]
}

export class UpdateBody {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  entityIds?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  subject?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date

  @ApiPropertyOptional({ type: TaskPriority, enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @ApiPropertyOptional({ type: TaskStatus, enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}
