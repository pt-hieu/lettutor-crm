import { DTO } from 'src/type'
import { Public } from 'src/utils/decorators/public.decorator'
import { Body, Controller, Get, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserService } from './user.service'
import { GetUser } from 'src/utils/decorators/get-user.decorator'
import { User } from './user.entity'

@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'to request for reset password email' })
  requestResetPwdEmail(@Body() dto: DTO.User.RequestResetPwd) {
    return this.service.requestResetPwdEmail(dto)
  }

  @Public()
  @Get('validate-token')
  @ApiOperation({ summary: 'to validate reset password token' })
  validateToken(@Query() dto: DTO.User.FindByTokenQuery) {
    return this.service.findByResetPwdToken(dto)
  }

  @Public()
  @Put('password')
  @ApiOperation({ summary: 'to reset password with token' })
  resetPwd(@Body() dto: DTO.User.ResetPwd) {
    return this.service.resetPwd(dto)
  }

  @Public()
  @Patch('change-password')
  @ApiOperation({ summary: 'to request change password' })
  changePwd(@Body() dto: DTO.User.ChangePwd, @GetUser() user: User) {
    return this.service.changePwd(dto, user)
  }
}
