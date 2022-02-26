import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { File } from 'src/file/file.entity'
import { Lead } from 'src/lead/lead.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

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
}

@Entity({ name: 'note' })
export class Note extends BaseEntity {
  @ManyToOne(() => User, (u) => u.deals)
  @JoinColumn()
  owner: User | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  ownerId: string | null

  @ManyToOne(() => Lead, (lead) => lead.notes)
  @JoinColumn()
  lead: Lead

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  leadId: string | null

  @ManyToOne(() => Contact, (contact) => contact.notes)
  @JoinColumn()
  contact: Contact

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  contactId: string | null

  @ManyToOne(() => Account, (account) => account.notes)
  @JoinColumn()
  account: Account

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  accountId: string

  @ManyToOne(() => Deal, (deal) => deal.notes)
  @JoinColumn()
  deal: Deal

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  dealId: string | null

  @Column({ type: 'varchar', default: '' })
  title: string

  @Column({ type: 'varchar' })
  content: string

  @Column({ type: 'varchar', default: null })
  source: string | null

  @OneToMany(() => File, (file) => file.note)
  files: File[]
}
