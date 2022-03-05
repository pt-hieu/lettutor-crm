import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './auth.guard'
import { AwsModule } from './aws/aws.module'

@Module({
  imports: [AwsModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useValue: AuthGuard }],
  exports: [],
})
export class AppModule {}
