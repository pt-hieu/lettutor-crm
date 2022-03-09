import axios from 'axios'
import { API } from 'environment'
import { DealUpdateFormData } from 'pages/deals/[id]/edit'

import { TData } from '@components/Deals/DealStageMapping/DealStageTable'

import { Deal, DealStage } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'

export const getDeals =
  (
    params: {
      search?: string
      source?: LeadSource[]
      stage?: DealStage[]
      closeFrom?: Date
      closeTo?: Date
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Deal>>(API + '/apollo/deal', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getRawDeals = (token?: string) => () =>
  axios
    .get<Pick<Deal, 'id' | 'fullName'>[]>(API + '/apollo/deal/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const getDeal = (id?: string, token?: string) => () =>
  axios
    .get<Deal>(API + `/apollo/deal/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const updateDeal = async (params: {
  id: string
  dealInfo: Partial<DealUpdateFormData>
}) => {
  const { id, dealInfo } = params
  const { data } = await axios.patch<Deal>(API + `/apollo/deal/${id}`, dealInfo)

  return data
}

export const addDeal = async (dealInfo: DealUpdateFormData) => {
  const { data } = await axios.post<Deal>(API + `/apollo/deal`, dealInfo)
  return data
}

export const batchDelete = (ids: string[]) =>
  axios
    .delete(API + '/apollo/deal/batch', { data: { ids } })
    .then((r) => r.data)

export const updateDealStage = async (datas: TData[]) => {
  const { data } = await axios.patch<Deal>(
    API + `/apollo/deal/deal-stage`,
    datas,
  )
  return data
}
