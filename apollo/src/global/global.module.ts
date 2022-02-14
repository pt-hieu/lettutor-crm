import { Global, Module } from '@nestjs/common'
import { UtilService } from 'src/global/util.service'
import { PayloadService } from 'src/global/payload.service'
import { UserModule } from 'src/user/user.module'
import { EventsService } from './events.service'
import { HttpModule } from '@nestjs/axios'

@Global()
@Module({
  imports: [UserModule, HttpModule],
  providers: [UtilService, PayloadService, EventsService],
  exports: [UtilService, PayloadService],
})
export class GlobalModule {}
