import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { BaseEntity } from 'src/utils/base.entity'

@Entity({ name: 'file' })
export class File extends BaseEntity {
  @ManyToOne(() => Note, (n) => n.attachments, { onDelete: 'CASCADE' })
  @JoinColumn()
  note: Note | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  noteId: string | null

  @ManyToOne(() => Lead, (l) => l.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  lead: Lead | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  leadId: string | null

  @ManyToOne(() => Task, (l) => l.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  task: Task | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  taskId: string | null

  @ManyToOne(() => Deal, (l) => l.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  deal: Deal | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  dealId: string | null

  @ManyToOne(() => Contact, (l) => l.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  contact: Contact | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  contactId: string | null

  @ManyToOne(() => Account, (l) => l.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  account: Account | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  accountId: string | null

  @Column({ type: 'varchar' })
  key: string

  @Column({ type: 'varchar' })
  location: string

  @Column()
  size: number
}
