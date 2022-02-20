import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { NoteSort, NoteSource } from 'src/note/note.entity'
import { Paginate } from './paging'

export class AddNote {
  @ApiProperty()
  @IsUUID()
  ownerId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  leadId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contactId?: string

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
  @IsString()
  @MaxLength(100)
  title?: string

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  content?: string

  @ApiPropertyOptional({
    type: NoteSource,
    enum: NoteSource,
  })
  @IsString()
  source?: string
}


export class GetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  nTopRecent?: number

  @ApiPropertyOptional({
    type: NoteSort,
    enum: NoteSort,
  })
  @IsString()
  @IsOptional()
  sort?: string

  @ApiPropertyOptional({
    type: NoteSource,
    enum: NoteSource,
  })
  @IsString()
  source?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sourceId?: string
}


export class UpdateBody {
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
  @IsString()
  @MaxLength(100)
  title?: string

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  content?: string
}