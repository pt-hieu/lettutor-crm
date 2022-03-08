import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EnvService } from './env.service'
import { EventsService } from './events.service'
import { JwtAuthGuard } from './jwt.guard'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    HttpModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    PassportModule,
  ],
  controllers: [AppController],
  exports: [],
  providers: [
    AppService,
    EnvService,
    EventsService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
