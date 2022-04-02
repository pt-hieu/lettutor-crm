import { SetMetadata } from '@nestjs/common'

import { Actions } from 'src/type/action'

export const KEY = 'actions'
export const DefineAction = (...actions: Actions[]) => SetMetadata(KEY, actions)
