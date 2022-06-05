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
import { Log } from '@utils/models/log'
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
      .get<FeedStatus[] | Log[]>(API + '/apollo/feed', {
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

type CommentParams = {
  feedId: string
  category: FeedType
}

export const getComments = (params: CommentParams, token?: string) => () =>
  axios
    .get<FeedComment[]>(API + `/apollo/feed/comment/`, {
      headers: { authorization: `Bearer ${token}` },
      params,
    })
    .then((res) => res.data)

export const addComment = async (commentDto: AddCommentDto) => {
  const { content, files, ownerId, statusId, logId } = commentDto
  const formData = new FormData()

  formData.append('ownerId', ownerId)
  formData.append('content', content as string)
  statusId && formData.append('statusId', statusId as string)
  logId && formData.append('logId', logId as string)

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
