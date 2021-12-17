import { Transform } from 'class-transformer'
import {
  IsString
} from 'class-validator'

export class VerifyToken{

  @Transform((value) => console.log(value))
  mode?: string
}
