import { LogAction, LogSource, TChange } from 'src/log/log.entity'

export class CreateLog {
  source: LogSource
  action: LogAction
  changes: TChange[] | null
}
