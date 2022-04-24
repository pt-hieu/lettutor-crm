import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { File } from 'src/file/file.entity'
import { Entity as EntityData } from 'src/module/module.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

export enum NoteSort {
  LAST = 'last',
  FIRST = 'first',
}

export enum NoteFilter {
  ACCOUNT_ONLY = 'account',
}

@Entity({ name: 'note' })
export class Note extends Ownerful {
  @ManyToOne(() => Task, (task) => task.notes, { onDelete: 'CASCADE' })
  @JoinColumn()
  task: Task

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  taskId: string | null

  @ManyToOne(() => EntityData, (entity) => entity.notes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  entity: EntityData

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  entityId: string | null

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
