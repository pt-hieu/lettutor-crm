import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'
import { LeadAddFormData } from 'pages/leads/add-lead'
import { LeadUpdateFromData } from 'pages/leads/[id]/edit'

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

export const addLeadService = async (leadInfo: LeadAddFormData) => {
  const { data } = await axios.post<Lead>(API + '/api/lead-contact', leadInfo)
  return data
}

export const updateLead = async (params: {
  id: string
  leadInfo: LeadUpdateFromData
}) => {
  const { id, leadInfo } = params
  const { data } = await axios.patch<Lead>(
    API + `/api/lead-contact/${id}`,
    leadInfo,
  )

  return data
}
