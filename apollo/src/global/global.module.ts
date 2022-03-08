import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'

import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { UserModule } from 'src/user/user.module'

import { EventsService } from './events.service'

@Global()
@Module({
  imports: [UserModule, HttpModule],
  providers: [UtilService, PayloadService, EventsService],
  exports: [UtilService, PayloadService],
})
export class GlobalModule {}
