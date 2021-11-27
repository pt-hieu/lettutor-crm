import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
  IsEnum,
  MaxLength
} from 'class-validator'
import { Paginate } from './paging'
import { Role, UserStatus } from 'src/user/user.entity'

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

  @ApiPropertyOptional({ enum: UserStatus, enumName: 'User Status' })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus

  @ApiPropertyOptional({ enum: Role, enumName: 'Role' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

export class UpdateUser {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string
}