import axios from 'axios'
import { API } from 'environment'

import { Paginate, PagingQuery } from '@utils/models/paging'

import { Entity, Module } from '../models/module'

export const getModules = (token?: string) => () =>
  axios
    .get<Module[]>(API + '/apollo/module', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((r) => r.data)

export const createEntity = (moduleName: string) => (data: any) => {
  const name = data.name
  delete data.name

  return axios
    .post<Entity>(API + '/apollo/' + moduleName, { data, name })
    .then((r) => r.data)
}

export const getRawEntity = (moduleName: string) => () =>
  axios
    .get<Pick<Entity, 'id' | 'data'>[]>(API + '/apollo/' + moduleName + '/raw')
    .then((r) => r.data)

export const getEntities =
  (moduleName: string, params: {} & PagingQuery) => () =>
    axios
      .get<Paginate<Entity>>(API + '/apollo/' + moduleName, { params })
      .then((r) => r.data)

export const batchDeleteEntities = (ids: string[] | string) =>
  axios
    .delete(API + '/apollo/entity/batch', { data: { ids: [ids].flat() } })
    .then((r) => r.data)

export const getEntity = (name: string, id: string, token?: string) => () =>
  axios
    .get<Entity>(API + `/apollo/${name}/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
