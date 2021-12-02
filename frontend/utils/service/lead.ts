import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { Paginate } from '@utils/models/paging'
import { Role } from '@utils/models/user'
import { RecursivePartial } from '@utils/utils-type'
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

export const getLeads =
  (
    params: {
      page?: number
      limit?: number
      search?: string
      status?: LeadStatus[]
      source?: LeadSource[]
    },
    token?: string,
  ) =>
    () => {
      return Promise.resolve<Paginate<RecursivePartial<Lead>>>({
        items: [
          {
            id: '1',
            fullName: 'Hao',
            email: 'Hao@mail.com',
            phoneNum: '0123456789',
            source: LeadSource.NONE,
            owner: { name: 'Admin' },
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
