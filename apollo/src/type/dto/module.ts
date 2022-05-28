import { UnprocessableEntityException } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { Double } from 'typeorm'

import {
  FieldMeta,
  ReportType,
  TimeFieldName,
  TimeFieldType,
} from 'src/module/module.entity'

import { Paginate } from './paging'

export class CreateModule {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  description?: string
}

export class UpdateModule {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  meta: FieldMeta[]
}

export class AddEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsObject()
  data: Record<string, unknown>
}

export class AddEntityFromFile {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string
}


export class UpdateEnity {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>
}

export class GetManyEntity extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string
}

export class ConvertToDeal {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  closingDate: Date

  @ApiProperty()
  @IsUUID()
  stageId: string
}

export class BatchConvert {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module_name: string

  @ApiProperty()
  @IsObject()
  dto: Record<string, any>
}

export class ReportFilter extends Paginate {
  @ApiProperty({ enum: ReportType, enumName: 'Report type' })
  @IsEnum(ReportType)
  reportType: ReportType

  @ApiPropertyOptional({ enum: TimeFieldName, enumName: 'Name of Time Field' })
  @IsOptional()
  @IsEnum(TimeFieldName)
  @Transform(({ value, obj }: { value: TimeFieldName; obj: ReportFilter }) => {
    if (value && !obj.timeFieldType)
      throw new UnprocessableEntityException('Time Field Type is missing')

    return value
  })
  timeFieldName: TimeFieldName

  @ApiPropertyOptional({ enum: TimeFieldType, enumName: 'Type of Time Field' })
  @IsOptional()
  @IsEnum(TimeFieldType)
  @Transform(({ value, obj }: { value: TimeFieldType; obj: ReportFilter }) => {
    if (value && value === TimeFieldType.BETWEEN) {
      if (!obj.startDate && !obj.endDate) {
        throw new UnprocessableEntityException(
          'Start Date and End Date is missing',
        )
      }
      if (!obj.startDate) {
        throw new UnprocessableEntityException('Start Date is missing')
      }
      if (!obj.endDate) {
        throw new UnprocessableEntityException('End Date is missing')
      }
    } else if (value && value !== TimeFieldType.BETWEEN && !obj.singleDate) {
      throw new UnprocessableEntityException('Single Date is missing')
    }

    return value
  })
  timeFieldType: TimeFieldType

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  singleDate: Date
}
