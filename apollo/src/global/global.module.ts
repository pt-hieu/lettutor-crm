import { Global, Module } from '@nestjs/common'
import { UtilService } from 'src/global/util.service'
import { PayloadService } from 'src/global/payload.service'
import { UserModule } from 'src/user/user.module'

@Global()
@Module({
  imports: [UserModule],
  providers: [UtilService, PayloadService],
  exports: [UtilService, PayloadService],
})
export class GlobalModule {}
