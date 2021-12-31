import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Brackets, FindOneOptions, Repository } from 'typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { UserService } from 'src/user/user.service'
import { UtilService } from 'src/global/util.service'
import { Contact } from './contact.entity'

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly utilService: UtilService,
  ) {}

  async getMany(query: DTO.Contact.GetManyQuery) {
    let q = this.contactRepo
      .createQueryBuilder('lc')
      .leftJoin('lc.owner', 'owner')
      .leftJoin('lc.account', 'account')
      .addSelect([
        'owner.name',
        'owner.email',
        'account.fullName',
        'account.description',
      ])

    if (query.source)
      q.andWhere('lc.source IN (:...source)', { source: query.source })

    if (query.search) {
      q = q.andWhere(
        new Brackets((qb) =>
          qb
            .andWhere('lc.fullName ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('lc.description ILIKE :search', {
              search: `%${query.search}%`,
            }),
        ),
      )
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getContactById(option: FindOneOptions<Contact>, trace?: boolean) {
    const found = await this.contactRepo.findOne(option)

    if (!found) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Contact not found`)
    }

    if (trace) {
      await this.utilService.loadTraceInfo(found)
    }

    return found
  }

  async addContact(dto: DTO.Contact.AddContact) {
    await Promise.all([
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
    ])

    return this.contactRepo.save({ ...dto })
  }

  async update(id: string, dto: DTO.Contact.UpdateBody) {
    const contact = await this.getContactById({ where: { id } })

    await Promise.all([
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
    ])

    return this.contactRepo.save({
      ...contact,
      ...dto,
    })
  }
}
