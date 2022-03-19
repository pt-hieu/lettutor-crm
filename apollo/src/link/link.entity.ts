import { Column, Entity } from 'typeorm'

import { Ownerful } from 'src/utils/owner.entity'

export enum LinkSource {
  LEAD = 'lead',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  DEAL = 'deal',
  TASK = 'task',
}

export enum LinkSort {
  LAST = 'last',
  FIRST = 'first',
}

@Entity({ name: 'link' })
export class Link extends Ownerful {
  @Column({ enum: LinkSource, type: 'enum', default: LinkSource.LEAD })
  source: LinkSource

  @Column({ type: 'uuid' })
  entityId: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  url: string
}
