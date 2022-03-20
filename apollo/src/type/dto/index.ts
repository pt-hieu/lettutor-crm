import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export * as User from './user'
export * as Auth from './auth'
export * as Lead from './lead'
export * as Contact from './contact'
export * as Account from './account'
export * as Deal from './deal'
export * as Role from './role'
export * as Paging from './paging'
export * as Webhook from './webhook'
export * as Task from './task'
export * as Note from './note'
export * as Strapi from './strapi'
export * as Log from './log'
export * as DealStage from './deal-stage'
export * as File from './file'

export class BatchDelete {
  @ApiProperty()
  @IsUUID(undefined, { each: true })
  ids: string[]
}
