import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { UtilService } from 'src/global/util.service'
import { ContactService } from 'src/contact/contact.service'
import { NoteService } from 'src/note/note.service'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import { FindOneOptions, In, Repository } from 'typeorm'
import { Deal, DealStage } from './deal.entity'
import { Actions } from 'src/type/action'
import { PayloadService } from 'src/global/payload.service'

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private dealRepo: Repository<Deal>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => NoteService))
    private readonly noteService: NoteService,
    private readonly contactService: ContactService,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
  ) {}

  getManyRaw() {
    return this.dealRepo.find({
      select: ['id', 'fullName'],
    })
  }

  async getMany(query: DTO.Deal.GetManyQuery) {
    let q = this.dealRepo
      .createQueryBuilder('d')
      .leftJoin('d.owner', 'owner')
      .leftJoin('d.account', 'account')
      .leftJoin('d.contact', 'contact')
      .leftJoin('d.tasks', 'tasks')
      .addSelect([
        'owner.name',
        'owner.email',
        'account.fullName',
        'account.description',
        'contact.fullName',
        'tasks.subject',
        'tasks.dueDate',
        'tasks.id',
      ])

    if (!this.utilService.checkRoleAction(Actions.VIEW_ALL_DEALS)) {
      q.andWhere('owner.id = :id', { id: this.payloadService.data.id })
    }

    if (query.closeFrom) {
      q.andWhere('d.closingDate > :from', {
        from: query.closeFrom.toISOString(),
      })
    }

    if (query.closeTo) {
      q.andWhere('d.closingDate < :to', { to: query.closeTo.toISOString() })
    }

    if (query.source)
      q.andWhere('d.source IN (:...source)', { source: query.source })

    if (query.stage)
      q.andWhere('d.stage IN (:...stage)', { stage: query.stage })

    if (query.search) {
      q = q.andWhere('d.fullName ILIKE :search', {
        search: `%${query.search}%`,
      })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getDealById(option: FindOneOptions<Deal>, trace?: boolean) {
    const deal = await this.dealRepo.findOne(option)

    if (!deal) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Deal not found`)
    }

    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(deal) &&
      !this.utilService.checkRoleAction(Actions.VIEW_ALL_DEAL_DETAILS) &&
      !this.utilService.checkRoleAction(Actions.VIEW_AND_EDIT_ALL_DEAL_DETAILS)
    ) {
      throw new ForbiddenException()
    }

    if (trace) {
      await this.utilService.loadTraceInfo(deal)
    }

    return deal
  }

  async addDeal(dto: DTO.Deal.AddDeal) {
    await Promise.all([
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
      dto.contactId
        ? this.contactService.getContactById({ where: { id: dto.contactId } })
        : undefined,
    ])

    return this.dealRepo.save(dto)
  }

  async updateDeal(dto: DTO.Deal.UpdateDeal, id: string) {
    const deal = await this.getDealById({ where: { id } })

    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(deal) &&
      !this.utilService.checkRoleAction(Actions.VIEW_AND_EDIT_ALL_DEAL_DETAILS)
    ) {
      throw new ForbiddenException()
    }

    if (dto.reasonForLoss) {
      if (
        (dto.stage === DealStage.CLOSED_LOST ||
          dto.stage === DealStage.CLOSED_LOST_TO_COMPETITION) &&
        dto.reasonForLoss
      ) {
        const note: DTO.Note.AddNote = new DTO.Note.AddNote()
        note.ownerId = dto.ownerId
        note.dealId = id
        note.title = dto.stage
        note.content = dto.reasonForLoss
        this.noteService.addNote(note)
      }
    }

    return this.dealRepo.save({
      ...deal,
      ...dto,
    })
  }

  async batchDelete(ids: string[]) {
    const deals = await this.dealRepo.find({ where: { id: In(ids) } })
    for (const deal of deals) {
      if (
        !this.utilService.checkOwnership(deal) &&
        !this.utilService.checkRoleAction(Actions.DELETE_ACCOUNT)
      ) {
        throw new ForbiddenException()
      }
    }

    return this.dealRepo.remove(deals)
  }
}
