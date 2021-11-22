import { DTO } from 'src/type'
import { Public } from 'src/utils/decorators/public.decorator'
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserService } from './user.service'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { User } from './user.entity'
import { JwtPayload } from 'src/utils/interface'
import { Pagination } from 'nestjs-typeorm-paginate'
import { SimpleUser } from './user.interface'

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

  @Patch('change-password')
  @ApiOperation({ summary: 'to request change password' })
  changePwd(@Body() dto: DTO.User.ChangePwd, @Payload() payload: JwtPayload) {
    return this.service.changePwd(dto, payload)
  }

  @Get('')
  @ApiOperation({ summary: 'to get all users in the system' })
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('type') type: string,
  ): Promise<Pagination<SimpleUser>> {
    limit = limit > 100 ? 100 : limit

    if (type === null || type === undefined) return  this.service.listUsers({ page, limit })
    return this.service.listUsersAndFilter({ page, limit }, type)
  }
}
