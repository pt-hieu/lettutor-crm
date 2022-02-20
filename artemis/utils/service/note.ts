import { AddNoteDto, Note } from '@utils/models/note'
import { API } from 'environment'
import axios from 'axios'
import { Paginate, PagingQuery } from '@utils/models/paging'

export const addNote = async (noteInfo: AddNoteDto) => {
  const { data } = await axios.post<Note>(API + `/apollo/note`, noteInfo)
  return data
}

export const getNotes =
  (
    params: {
      search?: string
      // status?: LeadStatus[]
      // source?: LeadSource[]
      // from?: Date
      // to?: Date
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Note>>(API + '/apollo/note', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)
