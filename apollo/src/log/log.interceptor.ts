import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  CallHandler,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { isUUID } from 'class-validator'
import { Pagination } from 'nestjs-typeorm-paginate'
import { map } from 'rxjs/operators'
import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Task } from 'src/task/task.entity'
import { Repository } from 'typeorm'
import { Log } from './log.entity'

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private mappingRepo: Record<string, Repository<any>>
  private mappingNameField = {
    accountId: 'fullName',
    leadId: 'fullName',
    contactId: 'fullName',
    dealId: 'fullName',
    taskId: 'subject',
  }

  constructor(
    @InjectRepository(Account) accountRepo: Repository<Account>,
    @InjectRepository(Lead) leadRepo: Repository<Lead>,
    @InjectRepository(Deal) dealRepo: Repository<Deal>,
    @InjectRepository(Contact) contactRepo: Repository<Contact>,
    @InjectRepository(Task) taskRepo: Repository<Task>,
  ) {
    this.mappingRepo = {
      accountId: accountRepo,
      leadId: leadRepo,
      contactId: contactRepo,
      dealId: dealRepo,
      taskId: taskRepo,
    }
  }

  async intercept(_context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      map(async (data: Pagination<Log>) => {
        const result = { ...data }
        result.items = await Promise.all(
          data.items.map(async (log) => ({
            ...log,
            changes: await Promise.all(
              log.changes?.map(async ({ from, name, to }) => {
                let fromName: string = undefined,
                  toName: string = undefined

                if (isUUID(from) || isUUID(to)) {
                  fromName = await this.mappingRepo[name]
                    ?.findOne({
                      where: { id: from },
                      select: [this.mappingNameField[name]],
                    })
                    .then((r) => r?.[this.mappingNameField[name]])

                  toName = await this.mappingRepo[name]
                    ?.findOne({
                      where: { id: to },
                      select: [this.mappingNameField[name]],
                    })
                    .then((r) => r?.[this.mappingNameField[name]])
                }

                return {
                  name,
                  from,
                  fromName,
                  to,
                  toName,
                }
              }) || [],
            ),
          })),
        )

        return result
      }),
    )
  }
}
