import {
  All,
  Body,
  Controller,
  Header,
  Param,
  Post,
  Query,
  Headers,
  Req,
  Sse,
  ForbiddenException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { AnyFilesInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { AppService } from './app.service'
import { EnvService } from './env.service'
import { EventsService } from './events.service'

@Controller()
export class AppController {
  constructor(
    private service: AppService,
    private events: EventsService,
    private env: EnvService,
  ) {}

  @Post('events')
  handleEvents(
    @Body() dto: { opcode: string; payload?: unknown },
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== this.env.apiKey) {
      throw new ForbiddenException()
    }

    this.events.emit(dto)
  }

  @Sse('subscribe')
  handleSubscription() {
    return this.events.$emitter
  }

  @All(':path(**)')
  @UseInterceptors(AnyFilesInterceptor())
  handleRequest(
    @Param('path') path: string,
    @Req() req: Request,
    @Query() query: object,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (req.method === 'OPTION' || req.method === 'option') {
      return 'ok'
    }

    return this.service.handleService({ path, req, query, files })
  }
}
