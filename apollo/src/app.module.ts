import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth.guard'
import { ActionGuard } from './action.guard'
import { MailModule } from './mail/mail.module'
import { AccountModule } from './account/account.module'
import { DealModule } from './deal/deal.module'
import { WebhookModule } from './webhook/webhook.module'
import { HttpModule } from '@nestjs/axios'
import { BaseSubscriber } from './base.subscriber'
import { GlobalModule } from './global/global.module'
import { TaskModule } from './task/task.module'
import { NoteModule } from './note/note.module'
import { LeadModule } from './lead/lead.module'
import { ContactModule } from './contact/contact.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { RoleModule } from './role/role.module'

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
    ContactModule,
    AccountModule,
    DealModule,
    WebhookModule,
    HttpModule,
    TaskModule,
    RoleModule,
    NoteModule,
    GlobalModule,
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
