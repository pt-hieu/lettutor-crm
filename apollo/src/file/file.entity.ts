import { Exclude } from 'class-transformer'
import { Note } from 'src/note/note.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity({ name: 'file' })
export class File extends BaseEntity {
  @ManyToOne(() => Note, (n) => n.attachments, { onDelete: 'CASCADE' })
  @JoinColumn()
  note: Note | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  noteId: string | null

  @Column({ type: 'varchar' })
  key: string

  @Column({ type: 'varchar' })
  location: string

  @Column()
  size: number
}
