import { Global, Module } from '@nestjs/common'
import { UtilService } from 'src/global/util.service'
import { PayloadService } from 'src/global/payload.service'
import { UserModule } from 'src/user/user.module'
import { EmitterService } from './emitter.service'
import { SubscribeController } from './subscribe.controller'

@Global()
@Module({
  imports: [UserModule],
  controllers: [SubscribeController],
  providers: [UtilService, PayloadService, EmitterService],
  exports: [UtilService, PayloadService],
})
export class GlobalModule {}
