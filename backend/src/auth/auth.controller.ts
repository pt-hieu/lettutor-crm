import { DTO } from '@/type'
import { Public } from '@/utils/decorators/public.decorator'
import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  Response,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response as ExpressResponse, Request as ExpressRequest } from 'express'
import { AuthService } from './auth.service'

@ApiTags('auth')
@ApiBearerAuth('jwt')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Public()
  @ApiOperation({ summary: "to validate credentials" })
  @Post('validate')
  logIn(@Body() body: DTO.Auth.Login) {
    return this.service.validate(body)
  }

  @Public()
  @ApiOperation({ summary: "to signup" })
  @Post('signup')
  signUp(@Body() body: DTO.Auth.SignUp) {
    return this.service.signup(body)
  }
}
