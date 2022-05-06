import { Base } from '@utils/models/base'
import { Attachments } from '@utils/models/note'

type TVisibility = {
  [k in 'Overview' | 'Update' | 'Create' | 'Detail']?: boolean
}

export enum FieldType {
  TEXT = 'Text',
  MULTILINE_TEXT = 'Multiline Text',
  PHONE = 'Phone',
  EMAIL = 'Email',
  NUMBER = 'Number',
  SELECT = 'Select',
  RELATION = 'Relation',
  DATE = 'Date',
  CHECK_BOX = 'Check Box',
}

export enum RelateType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
}

export interface FieldMeta {
  id?: string
  name: string
  group: string
  required: boolean
  type: FieldType
  visibility: TVisibility
  options?: string[]
  relateTo?: string
  relateType?: RelateType
  index?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
}

type Meta = FieldMeta[]

export interface Module extends Base {
  name: string
  description: string | null
  meta: Meta | null
  entities?: Entity[]
  convert_meta: ConvertMeta[]
}

type ConvertMeta = {
  source: string
  should_conver_note: boolean
  should_conver_attachment: boolean
  meta: Record<string, string>
}

export interface Entity extends Base {
  id: string
  name: string
  module: Module
  data: Record<string, unknown>
  attachments: Attachments[]
}
