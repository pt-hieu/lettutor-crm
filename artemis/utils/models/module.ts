import { RegisterOptions } from 'react-hook-form'

import { Base } from './base'

export enum FieldType {
  TEXT = 'Text',
  MULTILINE_TEXT = 'Multiline Text',
  PHONE = 'Phone',
  EMAIL = 'Email',

  NUMBER = 'Number',

  SELECT = 'Select',
  RELATION = 'Relation',
}

export interface FieldMeta {
  name: string
  group: string
  required: boolean
  type: FieldType
  options?: string[]
  relateTo?: string
  validation?: Pick<
    RegisterOptions,
    'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'
  >
}

type Meta = FieldMeta[]

export interface Module extends Base {
  name: string
  description: string | null
  meta: Meta | null
  entities?: Entity[]
}

export interface Entity extends Base {
  module: Module
  data: Record<string, unknown>
}
