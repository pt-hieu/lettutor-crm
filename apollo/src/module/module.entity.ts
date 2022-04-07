import { UnprocessableEntityException } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'
import {
  Allow,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  isUUID,
} from 'class-validator'
import { RegisterOptions } from 'react-hook-form'
import {
  Column,
  Entity as EntityDecorator,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import { Note } from 'src/note/note.entity'
import { BaseEntity } from 'src/utils/base.entity'

export enum FieldType {
  TEXT = 'Text',
  MULTILINE_TEXT = 'Multiline Text',
  PHONE = 'Phone',
  EMAIL = 'Email',

  NUMBER = 'Number',

  SELECT = 'Select',
  RELATION = 'Relation',
}

export enum RelateType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
}

type Visibility = {
  [k in 'Overview' | 'Update' | 'Create' | 'Detail']?: boolean
}

export class FieldMeta {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group: string

  @ApiProperty()
  @IsBoolean()
  required: boolean

  @ApiProperty()
  @Allow()
  visibility: Visibility

  @ApiProperty()
  @IsEnum(FieldType)
  type: FieldType

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @Transform(({ value, obj }: { value: unknown; obj: FieldMeta }) => {
    if (obj.type === FieldType.SELECT && (!value || !(value as any[]).length))
      throw new UnprocessableEntityException('Options is missing')

    return value
  })
  options?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value, obj }: { value: unknown; obj: FieldMeta }) => {
    if (obj.type === FieldType.RELATION && !value)
      throw new UnprocessableEntityException('Relate to is missing')

    return value
  })
  relateTo?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(RelateType)
  @Transform(({ value, obj }: { value: unknown; obj: FieldMeta }) => {
    if (obj.type === FieldType.RELATION && !value)
      throw new UnprocessableEntityException('Relate type is missing')

    return value
  })
  relateType?: RelateType

  @ApiPropertyOptional()
  @Allow()
  validation?: Pick<
    RegisterOptions,
    'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'
  >
}

type Meta = FieldMeta[]

@EntityDecorator()
export class Module extends BaseEntity {
  @Column({ unique: true })
  name: string

  @Column({ nullable: true })
  description: string | null

  @Column({ type: 'jsonb', nullable: true })
  meta: Meta | null

  @OneToMany(() => Entity, (e) => e.module, {
    cascade: true,
  })
  entities?: Entity[]

  public validateEntity(data: Record<string, unknown>): string | null {
    for (const { name, required, type, options, relateType } of this.meta) {
      if (!data[name] && required) return `${name} is required`
      if (!data[name] && !required) return null

      if (type === FieldType.RELATION && !isUUID(data[name]))
        return `${name} has to be a UUID`

      if (
        type === FieldType.RELATION &&
        relateType === RelateType.MULTIPLE &&
        !Array.isArray(data[name])
      ) {
        return `${name} has to be an array`
      }

      if (
        type === FieldType.RELATION &&
        relateType === RelateType.MULTIPLE &&
        Array.isArray(data[name]) &&
        (data[name] as string[]).some((id) => !isUUID(id))
      ) {
        return `${name} has to be an array of UUID`
      }

      if (
        type === FieldType.SELECT &&
        options.every((option) => option !== data[name])
      ) {
        return `Invalid option for ${data[name]}`
      }
    }

    return null
  }
}

@EntityDecorator()
export class Entity extends BaseEntity {
  @ManyToOne(() => Module, { eager: true, onDelete: 'CASCADE' })
  module: Module

  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  moduleId: string

  @Column()
  name: string

  @Column({ type: 'jsonb' })
  data: Record<string, unknown>

  @OneToMany(() => Note, (note) => note.entity, {
    cascade: true,
  })
  notes?: Note[]
}
