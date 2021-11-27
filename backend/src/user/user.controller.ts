import { DTO } from 'src/type'
import { Public } from 'src/utils/decorators/public.decorator'
import { Body, Controller, Get, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserService } from './user.service'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { Role } from './user.entity'
import { JwtPayload } from 'src/utils/interface'
import { Roles } from 'src/role.decorator'

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
  @ApiOperation({ summary: 'to update password with token' })
  resetPwd(@Body() dto: DTO.User.ResetPwd) {
    return this.service.resetPwd(dto)
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'to request change password' })
  changePwd(@Body() dto: DTO.User.ChangePwd, @Payload() payload: JwtPayload) {
    return this.service.changePwd(dto, payload)
  }

  @Post('add-user')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'to add a new user and send invitation mail' })
  addUser(@Body() dto: DTO.User.AddUser, @Payload() payload: JwtPayload) {
    return this.service.addUser(dto, payload.name)
  }

  @Get()
  @ApiOperation({ summary: 'to get all users in the system' })
  async index(@Query() query: DTO.User.UserGetManyQuery) {
    return this.service.getMany(query)
  }

  @Patch()
  @ApiOperation({ summary: 'to self-update user info' })
  updateUser(@Body() dto: DTO.User.UpdateUser, @Payload() payload: JwtPayload) {
    return this.service.updateUser(dto, payload)
  }

  @Get('self')
  @ApiOperation({ summary: 'to get user information' })
  getOne(@Payload() payload: JwtPayload) {
    return this.service.getOne(payload)
  }
}
