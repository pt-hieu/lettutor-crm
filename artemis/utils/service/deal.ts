import { Deal, DealStage } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'
import { DealUpdateFormData } from 'pages/deals/[id]/edit'

export const getDeals =
  (
    params: {
      search?: string
      source?: LeadSource[]
      stage?: DealStage[]
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Deal>>(API + '/api/deal', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getDeal = (id?: string, token?: string) => () =>
  axios
    .get<Deal>(API + `/api/deal/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const updateDeal = async (params: {
  id: string
  dealInfo: Partial<DealUpdateFormData>
}) => {
  const { id, dealInfo } = params
  const { data } = await axios.patch<Deal>(API + `/api/deal/${id}`, dealInfo)

  return data
}

export const addDeal = async (dealInfo: DealUpdateFormData) => {
  const { data } = await axios.post<Deal>(API + `/api/deal`, dealInfo)
  return data
}
