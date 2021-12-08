import { SetMetadata } from '@nestjs/common'
import { ActionType } from './type'

export const KEY = 'actions'
export const DefineAction = (action: ActionType) => SetMetadata(KEY, action)
