import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DTO } from 'src/type'
import { Payload } from 'src/utils/decorators/payload.decorator'

import { JwtPayload } from './../utils/interface'
import { NotificationService } from './notification.service'

@Controller('notification')
@ApiTags('notification')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'to get notifications of the current session' })
  getMany(
    @Payload() payload: JwtPayload,
    @Query() dto: DTO.Notification.GetManyNotification,
  ) {
    return this.service.getMany(payload.id, dto)
  }

  @Put(':id/read')
  @ApiOperation({ summary: "to toggle a notification' read" })
  toggleRead(
    @Payload() payload: JwtPayload,
    @Query('value', ParseBoolPipe) value: boolean,
    @Param('id', ParseUUIDPipe) notiId: string,
  ) {
    return this.service.toggleRead(payload.id, notiId, value)
  }
}
