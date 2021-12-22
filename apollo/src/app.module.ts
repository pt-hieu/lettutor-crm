import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './jwt.guard'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { ActionGuard } from './action.guard'
import { MailModule } from './mail/mail.module'
import { LeadContactModule } from './lead-contact/lead-contact.module'
import { AccountModule } from './account/account.module'
import { DealModule } from './deal/deal.module'
import { WebhookModule } from './webhook/webhook.module'
import { HttpModule } from '@nestjs/axios'
import { PayloadService } from './payload.service'
import { BaseSubscriber } from './base.subscriber'
import { TaskModule } from './task/task.module';

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
    UserModule,
    MailModule,
    AuthModule,
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    LeadContactModule,
    AccountModule,
    DealModule,
    WebhookModule,
    HttpModule,
    TaskModule
  ],
  providers: [
    JwtStrategy,
    PayloadService,
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
