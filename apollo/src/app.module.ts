import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountModule } from './account/account.module'
import { ActionGuard } from './action.guard'
import { JwtAuthGuard } from './auth.guard'
import { AuthModule } from './auth/auth.module'
import { BaseSubscriber } from './base.subscriber'
import { ContactModule } from './contact/contact.module'
import { DealModule } from './deal/deal.module'
import { FileModule } from './file/file.module'
import { GlobalModule } from './global/global.module'
import { LeadModule } from './lead/lead.module'
import { LogModule } from './log/log.module'
import { MailModule } from './mail/mail.module'
import { NoteModule } from './note/note.module'
import { RoleModule } from './role/role.module'
import { TaskModule } from './task/task.module'
import { UserModule } from './user/user.module'
import { WebhookModule } from './webhook/webhook.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      logging: false,
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    MailModule,
    AuthModule,
    LeadModule,
    HttpModule.register({
      timeout: 5000,
    }),
    ContactModule,
    AccountModule,
    DealModule,
    WebhookModule,
    TaskModule,
    RoleModule,
    NoteModule,
    LogModule,
    GlobalModule,
    FileModule,
  ],
  providers: [
    BaseSubscriber,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActionGuard,
    },
  ],
})
export class AppModule {}
