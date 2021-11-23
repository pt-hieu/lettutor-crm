import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsPositive, } from "class-validator"
import { Type} from "class-transformer"

export class Paginate {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  page = 1

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  limit = 10
}