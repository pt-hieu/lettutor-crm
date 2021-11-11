import { Role, User } from 'src/user/user.entity'

export const user: User = {
  email: 'admin@mail.com',
  id: '123',
  name: 'admin',
  password: '123',
  role: [Role.SUPER_ADMIN],
  resetPasswordToken: '1232',
  tokenExpiration: null,
  createdAt: null,
  updatedAt: null,
}
