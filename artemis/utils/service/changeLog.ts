import { toStrapi } from '@utils/libs/toStrapi'
import { Strapi } from '@utils/models/base'
import { ChangeLog } from '@utils/models/changeLog'
import { StrapiPaginate } from '@utils/models/paging'
import { POSEIDON_API } from 'environment'

export const getChangeLog = () =>
  toStrapi.get<StrapiPaginate<Strapi<ChangeLog>>>(POSEIDON_API + '/api/change-logs').then((res) => res.data)
