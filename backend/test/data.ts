import {
  LeadContact,
  LeadSource,
  LeadStatus,
} from 'src/lead-contact/lead-contact.entity'
import { Role, User, UserStatus } from 'src/user/user.entity'

export const user: User = {
  email: 'admin@mail.com',
  id: '123',
  name: 'admin',
  password: '$2b$10$CpcAGVAZ4uoVj1QOj3p99OhY5kTwYgi7JwbVYIpYganM.ZT6Bf1De',
  role: [Role.SUPER_ADMIN],
  passwordToken: '1232',
  status: UserStatus.ACTIVE,
  tokenExpiration: null,
  createdAt: null,
  updatedAt: null,
  leadContacts: [],
}

export const lead: LeadContact = {
  id: '1234',
  owner: user,
  ownerId: user.id,
  fullName: 'lead',
  email: 'lead@mail.com',
  leadStatus: LeadStatus.NONE,
  leadSource: LeadSource.NONE,
  address: null,
  description: null,
  phoneNum: null,
  socialAccount: null,
  createdAt: null,
  updatedAt: null,
}
