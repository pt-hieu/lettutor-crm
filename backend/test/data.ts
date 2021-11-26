import { Role, User } from 'src/user/user.entity'

export const user: User = {
  email: 'admin@mail.com',
  id: '123',
  name: 'admin',
  password: '$2b$10$CpcAGVAZ4uoVj1QOj3p99OhY5kTwYgi7JwbVYIpYganM.ZT6Bf1De', //123
  role: [Role.SUPER_ADMIN],
  passwordToken: '1232',
  tokenExpiration: null,
  createdAt: null,
  updatedAt: null,
}
