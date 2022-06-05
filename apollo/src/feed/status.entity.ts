import { Column, Entity, OneToMany } from 'typeorm'

import { File } from 'src/file/file.entity'
import { Ownerful } from 'src/utils/owner.entity'

import { Comment } from './comment.entity'

@Entity({ name: 'status' })
export class Status extends Ownerful {
  @Column({ type: 'varchar' })
  content: string

  @OneToMany(() => Comment, (comment) => comment.status, {
    eager: true,
    cascade: true,
  })
  comments?: Comment[]

  @OneToMany(() => File, (file) => file.status, {
    eager: true,
    cascade: true,
  })
  attachments?: File[]
}
