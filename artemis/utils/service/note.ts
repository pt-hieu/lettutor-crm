import { AddNoteDto, Note } from '@utils/models/note'
import { API } from 'environment'
import axios from 'axios'

export const addNote = async (noteInfo: AddNoteDto) => {
  const { data } = await axios.post<Note>(API + `/apollo/note`, noteInfo)
  return data
}
