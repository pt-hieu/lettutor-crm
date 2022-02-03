import { All, Controller, Param, Query, Req } from '@nestjs/common'
import { Request } from 'express'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private service: AppService) {}

  @All(':path(**)')
  handleRequest(
    @Param('path') path: string,
    @Req() req: Request,
    @Query() query: object,
  ) {
    if (req.method === 'OPTION' || req.method === 'option') {
      return 'ok'
    }

    return this.service.handleService({ path, req, query })
  }
}
