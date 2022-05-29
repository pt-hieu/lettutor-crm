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

    private readonly payloadService: PayloadService,
    private readonly fileService: FileService,
    private readonly utilService: UtilService,
  ) {}

  getManyStatuses(query: DTO.Feed.FeedFilter) {
    let qb

    if (
      query.category === FeedCategory.ALL ||
      query.category === FeedCategory.STATUS
    ) {
      qb = this.statusRepo
        .createQueryBuilder('status')
        .leftJoinAndSelect('status.attachments', 'attachments')
        .leftJoin('status.owner', 'owner')
        .addSelect(['owner.name', 'owner.email'])
    }

    if (
      query.category === FeedCategory.ALL ||
      query.category === FeedCategory.DEALS
    ) {
      // Will implement later
    }

    let date = new Date()
    switch (query.time) {
      case TimeCategory.NOW: {
        qb.where(
          `status.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `status.created_at < '${new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        )
        break
      }
      case TimeCategory.YESTERDAY: {
        qb.where(
          `status.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() - 1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `status.created_at < '${new Date(
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
        qb.where(
          `status.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `status.created_at <= '${new Date(
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
        qb.where(
          `status.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth() - 1,
            1,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `status.created_at <= '${new Date(
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
        qb.where(
          `status.created_at >= '${new Date(
            date.getFullYear(),
            date.getMonth() - 1,
            date.getDate() - 7,
          )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}'`,
        ).andWhere(
          `status.created_at < '${new Date(
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

  getCommentsByStatusId(id: string) {
    return this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.attachments', 'attachments')
      .leftJoinAndSelect('comment.status', 'status')
      .leftJoin('comment.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])
      .where(`status.id = '${id}'`)
      .getMany()
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
    const status = this.statusRepo.findOne({ id: dto.statusId })
    if (!status) {
      throw new NotFoundException('Not found Status')
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
