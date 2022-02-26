import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Note } from 'src/note/note.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity({ name: 'file' })
export class File extends BaseEntity {
  @ManyToOne(() => Note, (n) => n.files)
  @JoinColumn()
  note: Note | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  noteId: string | null

  @Column({ type: 'varchar' })
  filename: string

  @Column({ type: 'bytea' })
  @Exclude({ toPlainOnly: true })
  data: Uint8Array
}
