import { Repository, SelectQueryBuilder, Connection } from 'typeorm'

// @ts-ignore
export const mockConnection: MockType<Connection> = {
  createQueryBuilder: jest.fn().mockReturnThis(),
  // @ts-ignore
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  setParameters: jest.fn().mockReturnThis(),
  getRawOne: jest.fn().mockReturnValue(1)
}

// @ts-ignore
export const mockQueryBuilder: MockType<SelectQueryBuilder<any>> = {
  leftJoin: jest.fn().mockReturnThis(),
  loadRelationCountAndMap: jest.fn().mockReturnThis(),
  createQueryBuilder: jest.fn().mockReturnThis(),
  getQuery: jest.fn().mockReturnThis(),
  getParameters: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  // @ts-ignore
  connection: mockConnection
}

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    orderBy: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    count: jest.fn(),
    leftJoinAndSelect: jest.fn(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    groupBy: jest.fn(),
    leftJoin: jest.fn(),
  }),
)

export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>
}





