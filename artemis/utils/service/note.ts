import { AddNoteDto, Note } from '@utils/models/note'
import { API } from 'environment'
import axios from 'axios'
import { Paginate, PagingQuery } from '@utils/models/paging'
import { INoteData } from '@components/Notes/NoteAdder'

export const addNote = async (noteInfo: AddNoteDto) => {
  const { data } = await axios.post<Note>(API + `/apollo/note`, noteInfo)
  return data
}

export const getNotes =
  (
    params: {
      search?: string
      sort?: 'last' | 'first'
      source: 'lead' | 'contact' | 'account' | 'deal'
      sourceId: string
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

export const deleteNote = ({ noteId }: { noteId: string }) => {
  return axios.delete(API + `/apollo/note/${noteId}`)
}

export const editNote = ({
  noteId,
  dataInfo,
}: {
  noteId: string
  dataInfo: INoteData
}) => {
  return axios.patch(API + `/apollo/note/${noteId}`, { ...dataInfo })
}
