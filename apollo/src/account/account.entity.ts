import { Expose, Transform } from 'class-transformer'
import { Column, Entity, OneToMany } from 'typeorm'

import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { File } from 'src/file/file.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

export enum AccountType {
  NONE = 'None',
  ANALYST = 'Analyst',
  COMPETITOR = 'Competitor',
  CUSTOMER = 'Customer',
  DISTRIBUTOR = 'Distributor',
  INTEGRATOR = 'Integrator',
  INVESTOR = 'Investor',
  OTHER = 'Other',
  PARTNER = 'Partner',
  PRESS = 'Press',
  PROSPECT = 'Prospect',
  RESELLER = 'Reseller',
  VENDOR = 'Vendor',
}

const TransformAccountTask = ({ value, obj }: { value: any; obj: Account }) => {
  let tasksToDisplay = []
  obj.tasks ? (tasksToDisplay = tasksToDisplay.concat(obj.tasks)) : undefined

  obj.deals
    ? obj.deals.forEach((deal) => {
        deal.tasks
          ? (tasksToDisplay = tasksToDisplay.concat(deal.tasks))
          : undefined
      })
    : undefined

  obj.contacts
    ? obj.contacts.forEach((contact) => {
        contact.tasks
          ? (tasksToDisplay = tasksToDisplay.concat(contact.tasks))
          : undefined
      })
    : undefined

  return [...new Map(tasksToDisplay.map((o) => [o.id, o])).values()]
}

@Entity({ name: 'account' })
export class Account extends Ownerful {
  @Column({ type: 'varchar' })
  fullName: string

  @Column({ enum: AccountType, type: 'enum', default: AccountType.NONE })
  type: AccountType

  @Column({ type: 'varchar', nullable: true, default: null })
  address: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  phoneNum: string | null

  @OneToMany(() => Contact, (contact) => contact.account)
  contacts: Contact[]

  @OneToMany(() => Deal, (deal) => deal.account)
  deals: Deal[]

  @OneToMany(() => Task, (task) => task.account, { cascade: true })
  tasks: Task[]

  @OneToMany(() => Note, (note) => note.account, { cascade: true })
  notes: Note[]

  @OneToMany(() => File, (f) => f.account, { cascade: true, eager: true })
  attachments: File

  @Transform(TransformAccountTask, { toPlainOnly: true })
  @Expose()
  tasksToDisplay: Task[]
}
