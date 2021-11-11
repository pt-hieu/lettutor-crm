import { Repository } from 'typeorm'

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    createQueryBuilder: jest.fn(),
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