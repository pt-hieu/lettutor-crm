import { Exclude, Expose, Transform } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { BaseEntity } from 'src/utils/base.entity'

@Entity({ name: 'file' })
export class File extends BaseEntity {
  @ManyToOne(() => Note, (n) => n.attachments, { onDelete: 'CASCADE' })
  @JoinColumn()
  note: Note | null

  @Transform(({ obj }) => obj.createdById)
  @Expose()
  attachedById: string

  @ManyToOne(() => Task, (l) => l.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  task: Task | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  taskId: string | null

  @Column({ default: false })
  external: boolean

  @Column({ type: 'varchar' })
  key: string

  @Column({ type: 'varchar' })
  location: string

  @Column()
  size: number
}
