import axios from 'axios'
import { API } from 'environment'

import { Deal, DealStage, DealStageData } from '@utils/models/deal'
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

export const batchDelete = (ids: string[]) =>
  axios
    .delete(API + '/apollo/deal/batch', { data: { ids } })
    .then((r) => r.data)

export const getDealStages = (token?: string) => async () => {
  const { data } = await axios.get<any[]>(API + '/apollo/deal-stage', {
    headers: { authorization: `Bearer ${token}` },
  })

  return data
}

export const getRawDealStage = () =>
  axios
    .get<Pick<DealStageData, 'id' | 'name'>>(API + '/apollo/deal-stage/raw')
    .then((r) => r.data)

export const updateDealStage = async (datas: any[]) => {
  const { data } = await axios.post(API + `/apollo/deal-stage`, {
    items: datas,
  })
  return data
}
