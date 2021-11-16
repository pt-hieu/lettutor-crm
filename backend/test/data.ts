import { Role, User } from 'src/user/user.entity'

export const user: User = {
  email: 'admin@mail.com',
  id: '123',
  name: 'admin',
  password: '$2b$10$VQppQ7laiBl4aUD6..WQMeuKMEOERITpkaBN4bhRkjVd9PEqE0qb6', //123
  role: [Role.SUPER_ADMIN],
  resetPasswordToken: '1232',
  tokenExpiration: null,
  createdAt: null,
  updatedAt: null,
}
