import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { catchError, first, lastValueFrom } from 'rxjs'

import { Notification } from 'src/notification/notification.entity'

@Injectable()
export class EventsService {
  constructor(private http: HttpService) {}

  private async pushEventToGateway(dto: any) {
    await lastValueFrom(
      this.http
        .post(process.env.API_GATEWAY + '/events', dto, {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        })
        .pipe(
          first(),
          catchError((e, c) => {
            console.log(e)
            return c
          }),
        ),
    )
  }

  @OnEvent('noti.created', { async: true })
  onNotiCreated(dto: Notification) {
    this.pushEventToGateway(dto)
  }
}
