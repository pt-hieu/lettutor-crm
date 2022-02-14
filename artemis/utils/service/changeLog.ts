import { Strapi } from '@utils/models/base'
import { ChangeLog } from '@utils/models/changeLog'
import { StrapiPaginate } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getChangeLog = () =>
  axios.get<StrapiPaginate<Strapi<ChangeLog>>>(API + '/poseidon/change-logs').then((res) => res.data)
