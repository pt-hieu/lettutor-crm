import axios from 'axios'
import { API } from 'environment'

export enum Entity {
  LEAD = 'lead',
  TASK = 'task',
  DEAL = 'deal',
  ACCOUNT = 'account',
  CONTACT = 'contact',
}

export const addAttachmentAsFile =
  (id: string, entity: Entity) => (files: File[]) => {
    const data = new FormData()
    data.append('entity', entity)

    files.forEach((file) => {
      data.append('files', file)
    })

    return axios
      .post(API + '/apollo/file/attachment/' + id, data)
      .then((r) => r.data)
  }
