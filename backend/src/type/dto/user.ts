import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator'
import { Paginate } from './paging';
import {Role, UserStatus} from 'src/user/user.entity'

export class ResetPwd {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string
}

export class FindByTokenQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string
}

export class RequestResetPwd {
  @ApiProperty()
  @IsEmail()
  email: string
}

export class ChangePwd {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  newPassword: string
}

export class UserGetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  query?: string

  @ApiPropertyOptional()
  @IsOptional()
  userStatus?: UserStatus


  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: Role
}