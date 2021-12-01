import { Lead, LeadSource } from '@utils/models/lead'
import { Paginate } from '@utils/models/paging'
import { Role } from '@utils/models/user'
import axios from 'axios'
import { API } from 'environment'

// export const getLeads =
//   (
//     params: {
//       page?: number
//       limit?: number
//       search?: string
//     },
//     token?: string,
//   ) =>
//   () =>
//     axios
//       .get<Paginate<Lead>>(API + '/api/lead', {
//         headers: { authorization: 'Bearer ' + token },
//         params,
//       })
//       .then((res) => res.data)

export const getLeads = (
  params: {
    page?: number
    limit?: number
    search?: string
  },
  token?: string,
) => {
  return Promise.resolve<Paginate<Lead>>({
    items: [
      {
        id: '1',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts ',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '2',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '3',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '4',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '5',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '6',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '7',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '8',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
      {
        id: '9',
        name: 'Hao',
        email: 'Hao@mail.com',
        company: 'ABC  texts',
        phone: '0123456789',
        leadSource: LeadSource.Advertisement,
        leadOwner: { name: 'Admin' },
      },
    ],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 1,
      totalPages: 1,
      currentPage: 1,
    },
  })
}
