import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EnvService } from './env.service'

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  exports: [],
  providers: [AppService, EnvService],
})
export class AppModule {}
