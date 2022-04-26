import { Exclude } from 'class-transformer'
import { Column, Entity, ManyToOne } from 'typeorm'

import { Module } from 'src/module/module.entity'
import { BaseEntity } from 'src/utils/base.entity'

@Entity({ name: 'module_section' })
export class Section extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @Column()
  order: number

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  moduleId: string

  @ManyToOne(() => Module, { eager: true, onDelete: 'CASCADE' })
  module: Module
}
