import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { File } from 'src/file/file.entity'
import { Note } from 'src/note/note.entity'
import { Ownerful } from 'src/utils/owner.entity'

export enum TaskPriority {
  HIGH = 'High',
  HIGHEST = 'Highest',
  LOW = 'Low',
  LOWEST = 'Lowest',
  NORMAL = 'Normal',
}

export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  DEFERRED = 'Deferred',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  WAITING_FOR_INPUT = 'Waiting For Input',
}

@Entity({ name: 'task' })
export class Task extends Ownerful {
  @Column({ enum: TaskPriority, type: 'enum', default: TaskPriority.HIGH })
  priority: TaskPriority

  @Column({ enum: TaskStatus, type: 'enum', default: TaskStatus.NOT_STARTED })
  status: TaskStatus

  @Column({ type: 'varchar' })
  subject: string

  @Column({ type: 'date', nullable: true, default: null })
  dueDate: Date | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null

  @OneToMany(() => Note, (note) => note.task, { cascade: true })
  notes: Note[]

  @OneToMany(() => File, (f) => f.task, { cascade: true, eager: true })
  attachments: File
}
