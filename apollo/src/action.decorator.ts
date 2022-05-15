import { SetMetadata } from '@nestjs/common'

import { ActionType } from './action/action.entity'

export const KEY = 'actions'
export const DefineAction = (
  ...actions: { target: String; type: ActionType }[]
) => SetMetadata(KEY, actions)
