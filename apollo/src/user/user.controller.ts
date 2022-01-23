import { DTO } from 'src/type'
import { Public } from 'src/utils/decorators/public.decorator'
import { Body, Controller, Get, Patch, Post, Put, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { UserService } from './user.service'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { JwtPayload } from 'src/utils/interface'
import { DefineAction } from 'src/action.decorator'
import { Actions } from 'src/type/action'

@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
@ApiExtraModels(DTO.Paging.Paginate)
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

  @Get()
  @ApiOperation({ summary: 'to get all users in the system' })
  @ApiQuery({ type: DTO.User.UserGetManyQuery })
  async index(@Query() query: DTO.User.UserGetManyQuery) {
    return this.service.getMany(query)
  }

  @Get('raw')
  @ApiOperation({ summary: 'to get raw users in the system' })
  async getManyRaw() {
    return this.service.getManyRaw()
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_USER)
  @ApiOperation({ summary: 'to add a new user and send invitation mail' })
  addUser(@Body() dto: DTO.User.AddUser, @Payload() payload: JwtPayload) {
    return this.service.addUser(dto, payload.name)
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

  @Patch('change-password')
  @ApiOperation({ summary: 'to request change password' })
  changePwd(@Body() dto: DTO.User.ChangePwd, @Payload() payload: JwtPayload) {
    return this.service.changePwd(dto, payload)
  }
}
