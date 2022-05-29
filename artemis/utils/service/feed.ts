import axios from 'axios'
import { API } from 'environment'

import {
  AddCommentDto,
  AddStatusDto,
  FeedComment,
  FeedStatus,
  FeedTime,
  FeedType,
} from '@utils/models/feed'
import { PagingQuery } from '@utils/models/paging'

export const getFeeds =
  (
    params: {
      category: FeedType
      time: FeedTime
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<FeedStatus[]>(API + '/apollo/feed/status', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const addStatus = async (statusDto: AddStatusDto) => {
  const { content, files, ownerId } = statusDto
  const formData = new FormData()

  formData.append('ownerId', ownerId)
  formData.append('content', content as string)

  if (files) {
    for (const file of files) {
      formData.append('files', file)
    }
  }

  const { data } = await axios.post<FeedStatus>(
    API + `/apollo/feed/status`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return data
}

export const getComments = (statusId?: string, token?: string) => () =>
  axios
    .get<FeedComment[]>(API + `/apollo/feed/comment/${statusId}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const addComment = async (commentDto: AddCommentDto) => {
  const { content, files, ownerId, statusId } = commentDto
  const formData = new FormData()

  formData.append('ownerId', ownerId)
  formData.append('content', content as string)
  formData.append('statusId', statusId as string)

  if (files) {
    for (const file of files) {
      formData.append('files', file)
    }
  }

  const { data } = await axios.post<FeedComment>(
    API + `/apollo/feed/comment`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return data
}

export const deleteStatus = ({ id }: { id: string }) =>
  axios
    .delete(API + `/apollo/feed/status/batch`, {
      data: {
        ids: [id],
      },
    })
    .then((r) => r.data)

export const deleteComment = ({ id }: { id: string }) =>
  axios
    .delete(API + `/apollo/feed/comment/batch`, {
      data: {
        ids: [id],
      },
    })
    .then((r) => r.data)
