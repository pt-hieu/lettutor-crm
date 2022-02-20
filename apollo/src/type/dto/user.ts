import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUUID,
} from 'class-validator'
import { Paginate } from './paging'
import { UserStatus } from 'src/user/user.entity'

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

export class AddUser {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiProperty()
  @IsEmail()
  @MaxLength(100)
  email: string

  @ApiProperty()
  @IsUUID()
  roleId: string
}

export class UserGetManyQuery extends Paginate {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({ enum: UserStatus, enumName: 'User Status' })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: string
}

export class UpdateUser {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string
}

export class ActivateUser {
  @ApiPropertyOptional({ enum: UserStatus, enumName: 'User Status' })
  @IsEnum(UserStatus)
  status?: UserStatus
}
