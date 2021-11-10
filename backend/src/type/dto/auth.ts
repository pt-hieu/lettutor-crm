import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class Login {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string
}

export class SignUp {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string
}