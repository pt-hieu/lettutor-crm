import { SetMetadata } from '@nestjs/common'
import { Actions } from './type/action'

export const KEY = 'actions'
export const DefineAction = (action: Actions) => SetMetadata(KEY, action)
