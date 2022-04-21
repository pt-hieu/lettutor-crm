import axios from 'axios'
import { API } from 'environment'

import { INoteData } from '@components/Notes/NoteAdder'

import { AddNoteDto, Note } from '@utils/models/note'
import { Paginate, PagingQuery } from '@utils/models/paging'

export type SortNoteType = 'last' | 'first'

export const addNote = async (noteInfo: AddNoteDto) => {
  const { title, content, files, ownerId, source, taskId, entityId } = noteInfo
  const formData = new FormData()

  formData.append('ownerId', ownerId)
  formData.append('content', content as string)
  formData.append('source', source)

  title && formData.append('title', title)
  taskId && formData.append('taskId', taskId)
  entityId && formData.append('entityId', entityId)

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
      filter?: string
      source: string
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
  const { files, ...data } = dataInfo
  const formData = new FormData()

  console.log(dataInfo)

  Object.entries(data).forEach(([key, value]) => {
    if (value) formData.append(key, value)
  })

  if (files) {
    for (const file of files) {
      formData.append('files', file)
    }
  }

  return axios
    .patch(API + `/apollo/note/${noteId}`, formData)
    .then((r) => r.data)
}
