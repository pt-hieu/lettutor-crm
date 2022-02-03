import { DTO } from 'src/type'
import { Public } from 'src/utils/decorators/public.decorator'
import { Body, Controller, Post, Response as Res } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
@ApiSecurity('x-api-key')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'to validate credentials' })
  @Post('validate')
  logIn(
    @Body() body: DTO.Auth.Login,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.validate(body, res)
  }

  @Public()
  @ApiOperation({ summary: 'to signup' })
  @Post('signup')
  signUp(@Body() body: DTO.Auth.SignUp) {
    return this.service.signup(body)
  }
}
