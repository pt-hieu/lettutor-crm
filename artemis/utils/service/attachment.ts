import axios from 'axios'
import { API } from 'environment'

import { TFormData } from '@utils/components/AttachmentSection'
import { Attachments } from '@utils/models/note'

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

export const addAttachmentAsLink =
  (id: string, entity: Entity) => (data: TFormData) =>
    axios
      .post(API + '/apollo/file/attachment/external/' + id, {
        ...data,
        entity,
      })
      .then((r) => r.data)

export const deleteAttachment = (ids: string[]) =>
  axios
    .delete(API + '/apollo/file/batch', { data: { ids } })
    .then((r) => r.data)

export const updateAttachmentAsLink =
  (id: string) => (data: Pick<Attachments, 'key' | 'location'>) =>
    axios
      .patch(API + '/apollo/file/attachment/external/' + id, data)
      .then((r) => r.data)
