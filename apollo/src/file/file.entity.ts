import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Note } from 'src/note/note.entity'
import { AttachedEntity } from 'src/utils/attachment.entity'
import { BaseEntity } from 'src/utils/base.entity'

@Entity({ name: 'file' })
export class File extends BaseEntity {
  @ManyToOne(() => Note, (n) => n.attachments, { onDelete: 'CASCADE' })
  @JoinColumn()
  note: Note | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  noteId: string | null

  @ManyToOne(() => AttachedEntity, (a) => a.attachments, {
    onDelete: 'CASCADE',
  })
  entity: AttachedEntity

  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  entityId: string

  @Column({ type: 'varchar' })
  key: string

  @Column({ type: 'varchar' })
  location: string

  @Column()
  size: number
}
