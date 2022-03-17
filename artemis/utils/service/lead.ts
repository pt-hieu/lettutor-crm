import axios from 'axios'
import { API } from 'environment'
import { LeadUpdateFromData } from 'pages/leads/[id]/edit'
import { LeadAddFormData } from 'pages/leads/add-lead'

import { Account } from '@utils/models/account'
import { Deal } from '@utils/models/deal'
import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'

export const getLeads =
  (
    params: {
      search?: string
      status?: LeadStatus[]
      source?: LeadSource[]
      from?: Date
      to?: Date
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Lead>>(API + '/apollo/lead', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getRawLeads = (token?: string) => () =>
  axios
    .get<Pick<Lead, 'id' | 'fullName'>[]>(API + '/apollo/lead/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const getLead = (id?: string, token?: string) => () =>
  axios
    .get<Lead>(API + `/apollo/lead/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const addLeadService = async (leadInfo: LeadAddFormData) => {
  const { data } = await axios.post<Lead>(API + '/apollo/lead', leadInfo)
  return data
}

export const updateLead = async (params: {
  id: string
  leadInfo: LeadUpdateFromData
}) => {
  const { id, leadInfo } = params
  const { data } = await axios.patch<Lead>(API + `/apollo/lead/${id}`, leadInfo)

  return data
}

export const convertLead =
  (id: string, ownerId?: string) =>
  (
    data?:
      | Pick<Deal, 'amount' | 'closingDate' | 'fullName' | 'stageId'>
      | undefined,
  ) =>
    axios
      .post<[Account, Lead, Deal]>(
        API + '/apollo/lead/' + id + '/convert',
        data,
        {
          params: { ownerId },
        },
      )
      .then((res) => res.data)

export const batchDelete = (ids: string[]) =>
  axios
    .delete(API + '/apollo/lead/batch', { data: { ids } })
    .then((res) => res.data)
