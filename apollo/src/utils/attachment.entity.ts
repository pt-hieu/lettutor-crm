import { Entity, OneToMany } from 'typeorm'

import { File } from 'src/file/file.entity'

import { Ownerful } from './owner.entity'

@Entity()
export class AttachedEntity extends Ownerful {
  @OneToMany(() => File, (f) => f.entity, { cascade: true, eager: true })
  attachments: File[]
}
