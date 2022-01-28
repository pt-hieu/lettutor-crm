import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsPositive, IsOptional, IsBoolean } from 'class-validator'
import { Type, Transform } from 'class-transformer'

export class Paginate {
  @ApiPropertyOptional({ type: () => Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value)
    } catch (e) {
      return false
    }
  })
  shouldNotPaginate?: boolean

  @ApiPropertyOptional({ type: Number, default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  page = 1

  @ApiPropertyOptional({ type: Number, default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  limit = 10
}
