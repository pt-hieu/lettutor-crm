import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getLeads =
  (
    params: {
      search?: string
      status?: LeadStatus[]
      source?: LeadSource[]
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Lead>>(API + '/api/lead-contact', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getLead = (id?: string, token?: string) => () =>
  axios
    .get<Lead>(API + `/api/lead-contact/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
