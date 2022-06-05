import axios from 'axios'
import { API } from 'environment'

import { Paginate, PagingQuery } from '@utils/models/paging'

export function getMany(params: PagingQuery) {
  return () =>
    axios
      .get<Paginate<Notification> | Notification[]>(
        API + '/apollo/notification',
        { params },
      )
      .then((r) => r.data)
}

export function toggleRead(params: { value: boolean; id: string }) {
  return axios
    .put<Notification>(
      API + `/apollo/notification/${params.id}/read`,
      undefined,
      {
        params: {
          value: params.value,
        },
      },
    )
    .then((r) => r.data)
}
