import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'

import { NoteFilter, NoteSort, NoteSource } from 'src/note/note.entity'

import { TransformParams } from '../util'
import { Files } from './file'
import { Paginate } from './paging'

interface IAddNote {
  ownerId?: string
  leadId?: string
  contactId?: string
  accountId?: string
  dealId?: string
  taskId?: string
  title?: string
  content: string
  source?: NoteSource
}

export class AddNote extends Files implements IAddNote {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['leadId']>) => {
      if (obj.source !== NoteSource.LEAD) return null
      return value
    },
  )
  leadId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['contactId']>) => {
      if (obj.source === NoteSource.LEAD && obj.leadId) return null
      return value
    },
  )
  contactId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['accountId']>) => {
      if (obj.source === NoteSource.LEAD && obj.leadId) return null
      return value
    },
  )
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['dealId']>) => {
      if (
        (obj.source === NoteSource.LEAD && obj.leadId) ||
        (obj.source === NoteSource.ACCOUNT && obj.accountId)
      )
        return null

      return value
    },
  )
  dealId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['taskId']>) => {
      if (obj.source !== NoteSource.TASK && obj.taskId) return null
      return value
    },
  )
  taskId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string

  @ApiPropertyOptional({
    type: NoteSource,
    enum: NoteSource,
  })
  @IsString()
  source?: NoteSource
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

  @ApiPropertyOptional({
    type: NoteFilter,
    enum: NoteFilter,
  })
  @IsOptional()
  @IsString()
  filter?: NoteFilter
}

interface IUpdateBody extends Omit<IAddNote, 'source' | 'ownerId'> {}

export class UpdateBody extends Files implements IUpdateBody {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({
      value,
      obj,
    }: TransformParams<IUpdateBody, IUpdateBody['contactId']>) => {
      if (obj.leadId) return null
      return value
    },
  )
  contactId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IUpdateBody, IUpdateBody['leadId']>) => {
      if (obj.accountId || obj.contactId || obj.dealId) return null
      return value
    },
  )
  leadId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({
      value,
      obj,
    }: TransformParams<IUpdateBody, IUpdateBody['accountId']>) => {
      if (obj.leadId) return null
      if (obj.dealId) return null
      return value
    },
  )
  accountId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IUpdateBody, IUpdateBody['dealId']>) => {
      if (obj.leadId) return null
      if (obj.accountId) return null
      return value
    },
  )
  dealId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value }: TransformParams<IUpdateBody, IUpdateBody['taskId']>) => {
      return value
    },
  )
  taskId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  content: string

  @ApiProperty()
  @IsUUID(undefined, { each: true })
  attachments: string[]
}
