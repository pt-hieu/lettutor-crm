import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { MockType, repositoryMockFactory, mockQueryBuilder } from './utils'
import { Repository } from 'typeorm'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { deal } from './data'
import { Deal } from 'src/deal/deal.entity'
import { DealService } from 'src/deal/deal.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'

describe('deal service', () => {
  let dealRepo: MockType<Repository<Deal>>
  let dealService: DealService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        DealService,
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    dealRepo = ref.get(getRepositoryToken(Deal))
    dealService = ref.get(DealService)
  })

  describe('getMany', () => {
    it('should return deals succeed', async () => {
      const dto: DTO.Deal.GetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([deal])

      expect(
        ((await dealService.getMany(dto)) as Pagination<Deal, IPaginationMeta>)
          .items,
      ).toEqual([deal])
    })
  })

  describe('update deal', () => {
    it('should update deal succeed', async () => {
      const dto: DTO.Lead.UpdateLead = {
        email: 'update@mail.com',
      }
      dealRepo.findOne.mockReturnValue({ ...deal })
      dealRepo.save.mockReturnValue({ ...deal, ...dto })

      expect(await dealService.updateDeal(dto, deal.id)).toEqual({
        ...deal,
        ...dto,
      })
    })

    it('should throw not found exception when deal not found', async () => {
      const dto: DTO.Lead.UpdateLead = {
        email: 'update@mail.com',
      }

      dealRepo.findOne.mockReturnValue(undefined)

      expect(dealService.updateDeal(dto, deal.id)).rejects.toThrow(
        new NotFoundException(`Deal not found`),
      )
    })
  })

  describe('view deal detail', () => {
    it('should view deal detail success', async () => {
      dealRepo.findOne.mockReturnValue({ ...deal })

      expect(await dealService.getDealById({ where: { id: deal.id } })).toEqual(
        deal,
      )
    })

    it('should throw not found exception when deal not found ', async () => {
      dealRepo.findOne.mockReturnValue(undefined)

      expect(
        dealService.getDealById({ where: { id: deal.id } }),
      ).rejects.toThrow(
        new NotFoundException(
          `Deal not found`,
        ),
      )
    })
  })
})
