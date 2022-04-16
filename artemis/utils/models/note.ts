import { Base } from './base'
import { Entity } from './module'
import { Task } from './task'
import { User } from './user'

export type NoteSource = 'module' | 'task'

export type AddNoteDto = {
  ownerId: string
  entityId?: string
  taskId?: string
  title?: string
  content?: string
  files?: File[]
  source: NoteSource
}

export interface Attachments extends Base {
  key: string
  location: string
  size: number
  external: boolean
  attachedById: string
}

export interface Note extends Base {
  owner: User | null
  title: string
  content: string
  source: NoteSource
  entity: Pick<Entity, 'id' | 'name'>
  task: Task | null
  attachments: Attachments[]
}
