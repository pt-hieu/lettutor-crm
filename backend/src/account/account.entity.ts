import { Exclude } from 'class-transformer'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity({ name: 'account' })
export class Account extends BaseEntity {
  @Column({ type: 'uuid', select: false })
  ownerId: string

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ type: 'varchar' })
  email: string

  @Column({ type: 'varchar', nullable: true, default: null })
  address: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  phoneNum: string | null

  @OneToMany(() => LeadContact, (leadContact) => leadContact.account)
  @Exclude({ toPlainOnly: true })
  contacts: LeadContact[]
}
