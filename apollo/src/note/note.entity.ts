import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { File } from 'src/file/file.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

export enum NoteSort {
  LAST = 'last',
  FIRST = 'first',
}

export enum NoteFilter {
  ACCOUNT_ONLY = 'account',
}

export enum NoteSource {
  LEAD = 'lead',
  CONTACT = 'contact',
  ACCOUNT = 'account',
  DEAL = 'deal',
  TASK = 'task',
}

@Entity({ name: 'note' })
export class Note extends Ownerful {
  @ManyToOne(() => Task, (task) => task.notes, { onDelete: 'CASCADE' })
  @JoinColumn()
  task: Task

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  taskId: string | null

  @Column({ type: 'varchar', default: '' })
  title: string

  @Column({ type: 'varchar' })
  content: string

  @Column({ type: 'varchar', default: null })
  source: string | null

  @OneToMany(() => File, (file) => file.note, {
    eager: true,
    cascade: true,
  })
  attachments: File[]
}
