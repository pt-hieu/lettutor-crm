import { SetMetadata } from '@nestjs/common'
import { Actions } from './type/action'

export const KEY = 'actions'
export const DefineAction = (...actions: Actions[]) => SetMetadata(KEY, actions)
