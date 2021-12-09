import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'
import { LeadSource } from 'src/lead-contact/lead-contact.entity'
import { Paginate } from './paging'

export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ type: LeadSource, enum: LeadSource, isArray: true })
  @IsOptional()
  @IsEnum(LeadSource, { each: true })
  source?: LeadSource[]
}
