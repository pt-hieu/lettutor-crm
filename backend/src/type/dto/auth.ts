import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class Login {
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}

export class SignUp {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}