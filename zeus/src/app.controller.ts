import {
  All,
  Body,
  Controller,
  ForbiddenException,
  Header,
  Headers,
  MessageEvent,
  Param,
  Post,
  Query,
  Req,
  Sse,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { AnyFilesInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { Subject } from 'rxjs'

import { AppService } from './app.service'
import { EnvService } from './env.service'
import { EventsService } from './events.service'

declare global {
  namespace Express {
    interface User {
      id: string
    }
  }
}

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

    if (!dto.opcode) {
      return this.events.emitNotification(dto)
    }

    this.events.emit(dto)
  }

  @Sse('subscribe')
  handleSubscription() {
    return this.events.$emitter
  }

  @Sse('notification')
  handleNotificationSubscribe(@Req() req: Request) {
    req.on('close', () => {
      this.events.subjectMap.delete(req.user.id)
    })

    if (this.events.subjectMap.has(req.user.id)) {
      return this.events.subjectMap.get(req.user.id)
    }

    const $obs = new Subject<MessageEvent>()
    this.events.subjectMap.set(req.user.id, $obs)

    return $obs
  }

  @All(':path(**)')
  @UseInterceptors(AnyFilesInterceptor())
  handleRequest(
    @Param('path') path: string,
    @Req() req: Request,
    @Query() query: object,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (req.method === 'OPTION' || req.method === 'option') {
      return 'ok'
    }

    return this.service.handleService({ path, req, query, files })
  }
}
