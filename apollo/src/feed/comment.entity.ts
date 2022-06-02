import { Exclude } from 'class-transformer'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'

import { File } from 'src/file/file.entity'
import { Log } from 'src/log/log.entity'
import { Ownerful } from 'src/utils/owner.entity'

import { Status } from './status.entity'

@Entity({ name: 'comment' })
export class Comment extends Ownerful {
  @ManyToOne(() => Status, (status) => status.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  status: Status

  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  statusId: string | null

  @ManyToOne(() => Log, (log) => log.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  log: Log

  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  logId: string | null

  @Column({ type: 'varchar' })
  content: string

  @OneToMany(() => File, (file) => file.comment, {
    eager: true,
    cascade: true,
  })
  attachments?: File[]
}
