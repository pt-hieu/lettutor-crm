import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsPositive, IsOptional } from 'class-validator'

export class Paginate {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page = 1

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit = 10
}
