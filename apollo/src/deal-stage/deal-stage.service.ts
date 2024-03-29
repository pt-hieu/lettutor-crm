import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, In, Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { ModuleService } from 'src/module/module.service'
import { DTO } from 'src/type'
import { DealStageAction } from 'src/type/dto/deal-stage'

import { DealStage, DealStageType } from './deal-stage.entity'
import { defaultDealStages } from './default.deal-stage'

@Injectable()
export class DealStageService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(DealStage)
    private dealStageRepo: Repository<DealStage>,
    private readonly utilService: UtilService,
    private readonly moduleService: ModuleService,
  ) {}

  async onApplicationBootstrap() {
    await this.initDefaultDealStages()
  }

  private async initDefaultDealStages() {
    if (process.env.NODE_ENV === 'production') return
    const dealStages = await this.dealStageRepo.find()
    if (dealStages.length > 0) return

    return this.dealStageRepo.upsert(defaultDealStages, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    })
  }

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

  getRaw() {
    return this.dealStageRepo.find({
      select: ['id', 'name', 'type'],
      loadEagerRelations: false,
      order: {
        order: 'ASC',
      },
    })
  }

  async getAll() {
    const dealStages = await this.dealStageRepo.find({
      order: { order: 1 },
    })

    for (const dealStage of dealStages) {
      dealStage['deals'] = await this.moduleService.getManyDealByStageId(
        dealStage.id,
      )
    }
    return dealStages
  }

  async modifyDealStage(dtos: DTO.DealStage.ModifyDealStage[]) {
    this.validateStages(dtos)

    let order = 0
    const actionMappings: Record<
      DealStageAction,
      (v: DTO.DealStage.ModifyDealStage) => Promise<DealStage | DealStage[]>
    > = {
      [DealStageAction.ADD]: (dto) => {
        order++
        return this.addDealStage({
          ...dto,
          order,
        })
      },
      [DealStageAction.UPDATE]: (dto) => {
        order++
        return this.updateDealStage({
          ...dto,
          order,
        })
      },
      [DealStageAction.DELETE]: (dto) => {
        try {
          return this.batchDelete([dto.id])
        } catch (err) {
          // if delete fail, increase order for this deal stage
          order++
          throw err
        }
      },
    }

    return await Promise.all(
      dtos.map(async (dto) => {
        const result = await actionMappings[
          dto.action || DealStageAction.UPDATE
        ](dto)
        return result
      }),
    )
  }

  addDealStage(dto: DTO.DealStage.ModifyDealStage) {
    return this.dealStageRepo.save(dto)
  }

  async updateDealStage(dto: DTO.DealStage.ModifyDealStage) {
    const stage = await this.getDealStageById({ where: { id: dto.id } })
    return this.dealStageRepo.save({ ...stage, ...dto })
  }

  async batchDelete(ids: string[]) {
    const stages = await this.dealStageRepo.find({
      where: { id: In(ids) },
    })
    // await this.checkCanDelete(stages)
    return this.dealStageRepo.softRemove(stages)
  }

  private validateStages(dtos: DTO.DealStage.ModifyDealStage[]) {
    const counts: Record<DealStageType, number> = {
      [DealStageType.CLOSE_LOST]: 0,
      [DealStageType.CLOSE_WON]: 0,
      [DealStageType.OPEN]: 0,
    }

    dtos.forEach((dto) => {
      if (dto.action === DealStageAction.DELETE) return
      counts[dto.type]++
    })

    if (Object.values(counts).reduce((sum, count) => sum + count) >= 3) return
    throw new BadRequestException(
      'Deal stage must has at least 1 "Open", 1 "Close Won" and 1 "Close Lost" category',
    )
  }

  async checkCanDelete(stages: DealStage[]) {}
}
