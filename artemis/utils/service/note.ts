import axios from 'axios'
import { API } from 'environment'

import { INoteData } from '@components/Notes/NoteAdder'

import { AddNoteDto, Note, NoteSource } from '@utils/models/note'
import { Paginate, PagingQuery } from '@utils/models/paging'

export type SortNoteType = 'last' | 'first'
export type FilterNoteType = undefined | NoteSource

export const addNote = async (noteInfo: AddNoteDto) => {
  const {
    title,
    content,
    files,
    ownerId,
    source,
    leadId,
    contactId,
    dealId,
    accountId,
    taskId,
  } = noteInfo
  const formData = new FormData()
  formData.append('ownerId', ownerId)
  formData.append('content', content as string)
  title && formData.append('title', title)
  source && formData.append('source', source)
  leadId && formData.append('leadId', leadId)
  contactId && formData.append('contactId', contactId)
  dealId && formData.append('dealId', dealId)
  accountId && formData.append('accountId', accountId)
  taskId && formData.append('taskId', taskId)

  if (files) {
    for (const file of files) {
      formData.append('files', file)
    }
  }

  const { data } = await axios.post<Note>(API + `/apollo/note`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getNotes =
  (
    params: {
      search?: string
      sort?: SortNoteType
      filter?: FilterNoteType
      source: NoteSource
      sourceId: string
      nTopRecent?: number
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

export const deleteNote = ({ noteId }: { noteId: string }) =>
  axios
    .delete(API + `/apollo/note/batch`, {
      data: {
        ids: [noteId],
      },
    })
    .then((r) => r.data)

export const editNote = ({
  noteId,
  dataInfo,
}: {
  noteId: string
  dataInfo: INoteData
}) => {
  return axios.patch(API + `/apollo/note/${noteId}`, { ...dataInfo })
}
