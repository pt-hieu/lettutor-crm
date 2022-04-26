import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export * as User from './user'
export * as Role from './role'
export * as Paging from './paging'
export * as Webhook from './webhook'
export * as Task from './task'
export * as Note from './note'
export * as Strapi from './strapi'
export * as Log from './log'
export * as DealStage from './deal-stage'
export * as File from './file'
export * as Section from './module-section'
export * as Module from './module'
export * as Auth from './auth'

export class BatchDelete {
  @ApiProperty()
  @IsUUID(undefined, { each: true })
  ids: string[]
}
