import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

import { DefineAction } from 'src/action.decorator'
import { ActionType, DefaultActionTarget } from 'src/action/action.entity'
import { DTO } from 'src/type'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { Public } from 'src/utils/decorators/public.decorator'
import { JwtPayload } from 'src/utils/interface'

import { UserService } from './user.service'

@ApiTags('user')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
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
  getAllUser(@Query() query: DTO.User.UserGetManyQuery) {
    return this.service.getMany(query)
  }

  @Get('raw')
  @ApiOperation({ summary: 'to get raw users in the system' })
  async getManyRaw() {
    return this.service.getManyRaw()
  }

  @Post()
  @DefineAction({
    target: DefaultActionTarget.USER,
    type: ActionType.CAN_CREATE_NEW,
  })
  @ApiOperation({ summary: 'to add a new user and send invitation mail' })
  addUser(@Body() dto: DTO.User.AddUser, @Payload() payload: JwtPayload) {
    return this.service.addUser(dto, payload.name)
  }

  @Get(':id/invalidate')
  @DefineAction({
    target: DefaultActionTarget.ADMIN,
    type: ActionType.IS_ADMIN,
  })
  @ApiOperation({ summary: 'to resend invitation add user mail' })
  invalidateAddUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Payload() payload: JwtPayload,
  ) {
    return this.service.invalidateAddUserToken(id, payload.name)
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

  @Patch(':id/activate')
  @DefineAction({
    target: DefaultActionTarget.ADMIN,
    type: ActionType.IS_ADMIN,
  })
  @ApiOperation({ summary: 'to activate-deactivate user' })
  activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.User.ActivateUser,
  ) {
    return this.service.activateUser(id, dto)
  }

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete users' })
  @DefineAction({
    target: DefaultActionTarget.USER,
    type: ActionType.CAN_DELETE_ANY,
  })
  batchDeleteUser(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
