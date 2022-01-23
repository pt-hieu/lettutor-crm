import { Role } from 'src/role/role.entity'
import { Repository } from 'typeorm'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { RoleService } from '../src/role/role.service'
import { Test, TestingModule } from '@nestjs/testing'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { getRepositoryToken } from '@nestjs/typeorm'
import { role } from './data'
import { DTO } from 'src/type'
import { BadRequestException } from '@nestjs/common'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'

describe('role service', () => {
  let roleRepo: MockType<Repository<Role>>
  let roleService: RoleService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
        RoleService,
      ],
    }).compile()

    roleRepo = ref.get(getRepositoryToken(Role))
    roleService = ref.get(RoleService)
  })

  describe('getManyRole', () => {
    it('should return roles successfully', async () => {
      const dto: DTO.Role.GetManyRole = {
        limit: 10,
        page: 1,
      }

      mockQueryBuilder.getMany.mockReturnValue([role])

      expect(
        (
          (await roleService.getManyRole(dto)) as Pagination<
            Role,
            IPaginationMeta
          >
        ).items,
      ).toEqual([role])
    })
  })

  describe('createRole', () => {
    it('should create role successfully', async () => {
      const dto: DTO.Role.CreateRole = {
        actions: [],
        name: 'Test',
        childrenIds: [],
      }

      roleRepo.findOne.mockReturnValue(undefined)
      roleRepo.find.mockReturnValue([])
      roleRepo.save.mockReturnValue(role)

      expect(await roleService.createRole(dto)).toEqual(role)
    })

    it('should throw error when role existed', () => {
      const dto: DTO.Role.CreateRole = {
        actions: [],
        name: 'Test',
        childrenIds: [],
      }

      roleRepo.findOne.mockReturnValue(role)
      roleRepo.find.mockReturnValue([])
      roleRepo.save.mockReturnValue(role)

      expect(roleService.createRole(dto)).rejects.toThrow(
        new BadRequestException('Role existed'),
      )
    })
  })

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const dto: DTO.Role.UpdateRole = {
        actions: [],
        childrenIds: [],
        name: 'test',
      }

      roleRepo.findOne.mockReturnValue(undefined).mockReturnValueOnce(role)

      roleRepo.find.mockReturnValue([])
      roleRepo.save.mockReturnValue(Promise.resolve(role))

      expect(await roleService.updateRole('12', dto)).toEqual(role)
    })

    it('should throw error when role does not exist', () => {
      const dto: DTO.Role.UpdateRole = {
        actions: [],
        childrenIds: [],
        name: 'test',
      }

      roleRepo.findOne.mockReturnValue(undefined)

      expect(roleService.updateRole('12', dto)).rejects.toThrow(
        new BadRequestException('Role does not exist'),
      )
    })

    it('should throw error when name already exist', () => {
      const dto: DTO.Role.UpdateRole = {
        actions: [],
        childrenIds: [],
        name: 'test',
      }

      roleRepo.findOne.mockReturnValue(role)
      expect(roleService.updateRole('12', dto)).rejects.toThrow(
        new BadRequestException('Name has been taken'),
      )
    })
  })

  describe('removeRole', () => {
    it('should remove the role successfully', async () => {
      roleRepo.findOne.mockReturnValue(role)
      roleRepo.remove.mockReturnValue(role)

      expect(await roleService.removeRole('')).toEqual(role)
    })

    it('should throw error when role does not exist', () => {
      roleRepo.findOne.mockReturnValue(undefined)
      expect(roleService.removeRole('2')).rejects.toThrow(
        new BadRequestException('Role does not exist'),
      )
    })
  })
})
