import { Injectable } from '@nestjs/common'
import { OpCode } from 'src/type/opcode'
import { OnEvent } from '@nestjs/event-emitter'
import { HttpService } from '@nestjs/axios'
import { catchError, first, lastValueFrom } from 'rxjs'

@Injectable()
export class EventsService {
  constructor(private http: HttpService) {}

  private async pushEventToGateway(opcode: OpCode, payload?: unknown) {
    await lastValueFrom(
      this.http
        .post(
          process.env.API_GATEWAY + '/events',
          { opcode, payload },
          {
            headers: {
              'x-api-key': process.env.API_KEY,
            },
          },
        )
        .pipe(
          first(),
          catchError((e, c) => {
            console.log(e)
            return c
          }),
        ),
    )
  }

  @OnEvent('auth.invalidate', { async: true })
  invalidateSession(payload: unknown) {
    return this.pushEventToGateway(OpCode.INVALIDATE_SESSION, payload)
  }
}
