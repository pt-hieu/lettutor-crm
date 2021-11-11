import { DTO } from "src/type";
import { Public } from "src/utils/decorators/public.decorator";
import { Body, Controller, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";

@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {

  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: "to request for reset password email" })
  requestResetPwdEmail(@Body() dto: DTO.User.RequestResetPwd) {
    return this.service.requestResetPwdEmail(dto)
  }

  @Public()
  @Put('password')
  @ApiOperation({ summary: "to reset password with token" })
  resetPwd(@Body() dto: DTO.User.ResetPwd) {
    return this.service.resetPwd(dto)
  }
}