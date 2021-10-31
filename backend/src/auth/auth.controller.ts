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
import { Response as ExpressResponse, Request as ExpressRequest } from 'express'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Public()
  @Post('validate')
  logIn(@Body() body: DTO.Auth.Login) {
    return this.service.validate(body)
  }

  @Public()
  @Post('signup')
  signUp(@Body() body: DTO.Auth.SignUp) {
    return this.service.signup(body)
  }
}
