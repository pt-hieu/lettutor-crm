import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, In, Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
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
    this.doValidateStages(dtos)

    let order = 1

    const updateAction = async (dto: DTO.DealStage.ModifyDealStage) => {
      await this.updateDealStage({
        ids: dto.ids,
        name: dto.name,
        probability: dto.probability,
        category: dto.category,
        order,
      })
    }

    const actions = {
      Add: async (dto: DTO.DealStage.ModifyDealStage) => {
        await this.addDealStage({
          name: dto.name,
          probability: dto.probability,
          category: dto.category,
          order,
          ids: [],
        })
      },
      Update: updateAction,
      undefined: updateAction,
      Delete: async (dto: DTO.DealStage.ModifyDealStage) => {
        order--
        await this.batchDelete(dto.ids)
      },
    }

    for (const dto of dtos) {
      actions[dto.action](dto)
      order++
    }
  }

  async addDealStage(dto: DTO.DealStage.ModifyDealStage) {
    await this.dealStageRepo.save(dto)
  }

  async updateDealStage(dto: DTO.DealStage.ModifyDealStage) {
    const stage = await this.getDealStageById({ where: { id: In(dto.ids) } })
    return this.dealStageRepo.save({ ...stage, ...dto })
  }

  async batchDelete(ids: string[]) {
    const stages = await this.dealStageRepo.find({ where: { id: In(ids) } })
    return this.dealStageRepo.softRemove(stages)
  }

  doValidateStages(dtos: DTO.DealStage.ModifyDealStage[]) {
    let countOpen = 0
    let countCloseWon = 0
    let countCloseLost = 0

    for (const dto of dtos) {
      if (dto.action === DealStageAction.DELETE) {
        continue
      }

      if (dto.category === DealStageCategory.OPEN) {
        countOpen++
      } else if (dto.category === DealStageCategory.CLOSE_WON) {
        countCloseWon++
      } else if (dto.category === DealStageCategory.CLOSE_LOST) {
        countCloseLost++
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
