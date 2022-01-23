import { Transform } from 'class-transformer'

export class VerifyToken {
  @Transform((value) => console.log(value))
  mode?: string
}
