import { Exclude, Expose, Transform } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Comment } from 'src/feed/comment.entity'
import { Status } from 'src/feed/status.entity'
import { Entity as EntityModule } from 'src/module/module.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { BaseEntity } from 'src/utils/base.entity'


export enum FileExtension {
  CSV = 'csv',
  XLSX = 'xlsx',
}

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

  @ManyToOne(() => EntityModule, (entity) => entity.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  entity: EntityModule

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  entityId: string | null

  @ManyToOne(() => Status, (status) => status.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  status: Status

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  statusId: string | null

  @ManyToOne(() => Comment, (comment) => comment.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  comment: Comment

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  commentId: string | null

  @Column({ default: false })
  external: boolean

  @Column({ type: 'varchar' })
  key: string

  @Column({ type: 'varchar' })
  location: string

  @Column()
  size: number
}
