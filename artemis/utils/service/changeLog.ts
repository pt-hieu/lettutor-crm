import { ChangeLog } from '@utils/models/changeLog'
import { Paginate } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getChangeLog = () =>
  axios.get<Paginate<ChangeLog>>(API + '/poseidon/change-logs').then((res) => res.data)
