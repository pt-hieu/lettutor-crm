import { Contact } from '@utils/models/contact'
import { LeadSource } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getContacts =
  (
    params: {
      search?: string
      source?: LeadSource[]
    } & PagingQuery,
    token?: string,
  ) =>
    () =>
      axios
        .get<Paginate<Contact>>(API + '/api/contact', {
          headers: { authorization: 'Bearer ' + token },
          params,
        })
        .then((res) => res.data)
