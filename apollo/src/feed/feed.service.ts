import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { In, Repository } from 'typeorm'

import { File } from 'src/file/file.entity'
import { FileService } from 'src/file/file.service'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { Log, LogSource } from 'src/log/log.entity'
import { DTO } from 'src/type'
import { FeedCategory, TimeCategory } from 'src/type/dto/feed'

import { Comment } from './comment.entity'
import { Status } from './status.entity'

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Status)
    private statusRepo: Repository<Status>,

    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,

    @InjectRepository(Log)
    private logRepo: Repository<Log>,

    private readonly payloadService: PayloadService,
    private readonly fileService: FileService,
    private readonly utilService: UtilService,
  ) {}

  getManyStatuses(query: DTO.Feed.FeedFilter) {
    let qb

    if (query.category === FeedCategory.STATUS) {
      qb = this.statusRepo
        .createQueryBuilder('feed')
        .leftJoinAndSelect('feed.attachments', 'attachments')
        .leftJoin('feed.owner', 'owner')
        .addSelect(['owner.id', 'owner.name', 'owner.email'])
        .orderBy('feed.createdAt', 'DESC')
    }

    if (query.category === FeedCategory.DEALS) {
      qb = this.logRepo
        .createQueryBuilder('feed')
        .leftJoin('feed.owner', 'owner')
        .addSelect(['owner.id', 'owner.name', 'owner.email'])
        .orderBy('feed.createdAt', 'DESC')
        .where(`feed.source = '${LogSource.DEAL}'`)
    }

    if (query.category === FeedCategory.TASKS) {
      qb = this.logRepo
        .createQueryBuilder('feed')
        .leftJoin('feed.owner', 'owner')
        .addSelect(['owner.id', 'owner.name', 'owner.email'])
        .orderBy('feed.createdAt', 'DESC')
        .where(`feed.source = '${LogSource.TASK}'`)
    }

    const date = new Date()
    switch (query.time) {
      case TimeCategory.YESTERDAY: {
        qb.andWhere(
          `feed.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() - 1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `feed.created_at < '${new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        )
        break
      }
      case TimeCategory.CURRENT_MONTH: {
        qb.andWhere(
          `feed.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `feed.created_at <= '${new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        )
        break
      }
      case TimeCategory.LAST_MONTH: {
        qb.andWhere(
          `feed.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth() - 1,
            1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `feed.created_at <= '${new Date(
            date.getFullYear(),
            date.getMonth(),
            0,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        )
        break
      }
      case TimeCategory.LAST_WEEK: {
        qb.andWhere(
          `feed.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth() - 1,
            date.getDate() - 7,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `feed.created_at < '${new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        )
        break
      }
    }

    if (query.shouldNotPaginate === true) return qb.getMany()
    return paginate(qb, { limit: query.limit, page: query.page })
  }

  getCommentsByFeedId(query: DTO.Feed.GetComment) {
    const qb = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.attachments', 'attachments')
      .leftJoin('comment.owner', 'owner')
      .addSelect(['owner.id', 'owner.name', 'owner.email'])
      .orderBy('comment.createdAt', 'DESC')

    if (query.category === FeedCategory.STATUS) {
      qb.leftJoin('comment.status', 'status').where(
        `status.id = '${query.feedId}'`,
      )
    } else {
      qb.leftJoin('comment.log', 'log').where(`log.id = '${query.feedId}'`)
    }

    return qb.getMany()
  }

  async addStatus(dto: DTO.Feed.AddStatus) {
    let filesToAdd: File[] = []
    if (dto.files && dto.files.length > 0) {
      filesToAdd = await this.fileService.uploadFile(dto.files)
    }
    delete dto.files
    dto.ownerId = this.payloadService.data.id

    return this.statusRepo.save({ ...dto, attachments: filesToAdd })
  }

  async addComment(dto: DTO.Feed.AddComment) {
    if (dto.statusId) {
      const status = this.statusRepo.findOne({ id: dto.statusId })
      if (!status) {
        throw new NotFoundException('Not found Status')
      }
    } else if (dto.logId) {
      const log = this.logRepo.findOne({ id: dto.logId })
      if (!log) {
        throw new NotFoundException('Not found Deal or Task')
      }
    }

    let filesToAdd: File[] = []
    if (dto.files && dto.files.length > 0) {
      filesToAdd = await this.fileService.uploadFile(dto.files)
    }
    delete dto.files

    return this.commentRepo.save({ ...dto, attachments: filesToAdd })
  }

  async batchDeleteStatus(ids: string[]) {
    const statuses = await this.statusRepo.find({ where: { id: In(ids) } })

    statuses.forEach((status) => {
      if (!this.utilService.checkOwnership(status)) {
        throw new ForbiddenException()
      }
    })

    return this.statusRepo.softRemove(statuses)
  }

  async batchDeleteComment(ids: string[]) {
    const comments = await this.commentRepo.find({ where: { id: In(ids) } })

    comments.forEach((comment) => {
      if (!this.utilService.checkOwnership(comment)) {
        throw new ForbiddenException()
      }
    })

    return this.commentRepo.softRemove(comments)
  }
}
