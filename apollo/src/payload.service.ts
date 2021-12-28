import { Injectable } from '@nestjs/common'
import { JwtPayload } from './utils/interface'

@Injectable()
export class PayloadService {
  private _data?: JwtPayload
  public get data(): JwtPayload {
    return this._data
  }
  public set data(value: JwtPayload | undefined) {
    this._data = value
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}
