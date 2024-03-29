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

import { NoteFilter, NoteSort } from 'src/note/note.entity'

import { TransformParams } from '../util'
import { Files } from './file'
import { Paginate } from './paging'

interface IAddNote {
  ownerId?: string
  entityId?: string
  taskId?: string
  title?: string
  content: string
  source?: string
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
    ({ value, obj }: TransformParams<IAddNote, IAddNote['entityId']>) => {
      if (obj.source === 'task') return null
      return value
    },
  )
  entityId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['taskId']>) => {
      if (obj.source !== 'task') return null
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

  @ApiPropertyOptional({})
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

  @ApiPropertyOptional()
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
    ({ value, obj }: TransformParams<IAddNote, IAddNote['entityId']>) => {
      if (obj.source === 'task') return null
      return value
    },
  )
  entityId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value, obj }: TransformParams<IAddNote, IAddNote['taskId']>) => {
      if (obj.source !== 'task') return null
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
  @IsOptional()
  @IsUUID(undefined, { each: true })
  attachments?: string[]
}
