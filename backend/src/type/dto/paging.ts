import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsPositive, IsOptional } from "class-validator"
import { Type } from "class-transformer"

export class Paginate {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  page = 1

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  limit = 10
}