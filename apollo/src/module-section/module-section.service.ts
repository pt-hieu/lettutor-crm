import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, In, Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { CoLumn } from 'src/module/module.entity'
import { ModuleService } from 'src/module/module.service'
import { DTO } from 'src/type'
import { SectionAction } from 'src/type/dto/module-section'

import { Section } from './module-section.entity'

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private sectionRepo: Repository<Section>,
    private readonly utilService: UtilService,
    private readonly moduleService: ModuleService,
  ) {}

  async getSectionById(option: FindOneOptions<Section>, trace?: boolean) {
    const section = await this.sectionRepo.findOne(option)

    if (!section) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Section not found`)
    }

    if (trace) {
      await this.utilService.loadTraceInfo(section)
    }

    section['left_meta'] = await this.moduleService.getManyMetaBySection(
      section.moduleId,
      section.id,
      CoLumn.LEFT,
    )

    section['right_meta'] = await this.moduleService.getManyMetaBySection(
      section.moduleId,
      section.id,
      CoLumn.RIGHT,
    )

    return section
  }

  async getSectionsByModule(moduleId: string) {
    const sections = await this.sectionRepo.find({
      where: { moduleId },
      order: { order: 1 },
    })

    for (const section of sections) {
      section['left_meta'] = await this.moduleService.getManyMetaBySection(
        moduleId,
        section.id,
        CoLumn.LEFT,
      )
    }

    for (const section of sections) {
      section['right_meta'] = await this.moduleService.getManyMetaBySection(
        moduleId,
        section.id,
        CoLumn.RIGHT,
      )
    }

    return sections
  }

  async modifySections(moduleId: string, dtos: DTO.Section.ModifySection[]) {
    let order = 0
    const actionMappings: Record<
      SectionAction,
      (v: DTO.Section.ModifySection) => Promise<Section | Section[]>
    > = {
      [SectionAction.ADD]: (dto) => {
        order++
        return this.addSection({
          ...dto,
          moduleId,
          order,
        })
      },
      [SectionAction.UPDATE]: (dto) => {
        order++
        return this.updateSection({
          ...dto,
          order,
        })
      },
      [SectionAction.DELETE]: (dto) => {
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
        const result = await actionMappings[dto.action || SectionAction.UPDATE](
          dto,
        )
        return result
      }),
    )
  }

  addSection(dto: DTO.Section.ModifySection) {
    return this.sectionRepo.save(dto)
  }

  async updateSection(dto: DTO.Section.ModifySection) {
    const section = await this.getSectionById({ where: { id: dto.id } })
    return this.sectionRepo.save({ ...section, ...dto })
  }

  async batchDelete(ids: string[]) {
    const sections = await this.sectionRepo.find({
      where: { id: In(ids) },
    })
    //await this.checkCanDelete(sections)
    return this.sectionRepo.softRemove(sections)
  }
}
