import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { DealStageAction } from 'src/type/dto/deal-stage'

import { DealStage, DealStageCategory } from './deal-stage.entity'

@Injectable()
export class DealStageService {
  constructor(
    @InjectRepository(DealStage)
    private dealStageRepo: Repository<DealStage>,
    private readonly utilService: UtilService,
  ) {}

  async getDealStageById(option: FindOneOptions<DealStage>, trace?: boolean) {
    const dealStage = await this.dealStageRepo.findOne(option)

    if (!dealStage) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Deal stage not found`)
    }

    if (trace) {
      await this.utilService.loadTraceInfo(dealStage)
    }

    return dealStage
  }

  async getAll() {
    return this.dealStageRepo.find({ order: { order: 1 } })
  }

  async modifyDealStage(dtos: DTO.DealStage.ModifyDealStage[]) {
    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkRoleAction(Actions.MODIFY_ALL_DEAL_STAGES)
    ) {
      throw new ForbiddenException()
    }

    this.doValidateStages(dtos)

    let order = 1
    for (const dto of dtos) {
      switch (dto.action) {
        case DealStageAction.ADD: {
          await this.addDealStage({
            name: dto.name,
            probability: dto.probability,
            category: dto.category,
            order,
          })
          break
        }

        // undefined = no action
        case DealStageAction.UPDATE:
        case undefined: {
          await this.updateDealStage({
            id: dto.id,
            name: dto.name,
            probability: dto.probability,
            category: dto.category,
            order,
          })
          break
        }

        case DealStageAction.DELETE: {
          order--
          await this.batchDelete(dto.id)
          break
        }
      }

      order++
    }
  }

  async addDealStage(dto: DTO.DealStage.ModifyDealStage) {
    await this.dealStageRepo.save(dto)
  }

  async updateDealStage(dto: DTO.DealStage.ModifyDealStage) {
    const stage = await this.getDealStageById({ where: { id: dto.id } })
    return this.dealStageRepo.save({ ...stage, ...dto })
  }

  async batchDelete(id: string) {
    const stage = await this.getDealStageById({ where: { id } })
    return this.dealStageRepo.softRemove(stage)
  }

  doValidateStages(dtos: DTO.DealStage.ModifyDealStage[]) {
    let countOpen = 0
    let countCloseWon = 0
    let countCloseLost = 0

    for (const dto of dtos) {
      if (dto.action !== DealStageAction.DELETE) {
        dto.category === DealStageCategory.OPEN
          ? countOpen++
          : dto.category === DealStageCategory.CLOSE_WON
          ? countCloseWon++
          : countCloseLost++
      }
    }

    if (countOpen >= 1 && countCloseLost >= 1 && countCloseWon >= 1) {
      return
    }

    throw new BadRequestException(
      'Deal stage must has at least 1 "Open", 1 "Close Won" and 1 "Close Lost" category',
    )
  }
}
