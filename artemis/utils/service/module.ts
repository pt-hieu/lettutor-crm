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

export const updateModule = (id: string) => (data: Partial<Module>) =>
  axios.patch(API + '/apollo/module/' + id, data).then((r) => r.data)

export const createModule = (
  data: Pick<Module, 'name'> & Pick<Partial<Module>, 'description'>,
) => axios.post(API + '/apollo/module/', data).then((res) => res.data)

export const createEntity = (moduleName: string) => (data: any) => {
  const name = data.name
  delete data.name

  return axios
    .post<Entity>(API + '/apollo/module/' + moduleName, { data, name })
    .then((r) => r.data)
}

export const getRawEntity = (moduleName: string) => () =>
  axios
    .get<Pick<Entity, 'id' | 'data'>[]>(
      API + '/apollo/module/' + moduleName + '/raw',
    )
    .then((r) => r.data)

export const getEntities =
  (
    moduleName: string,
    params: { [x in string]?: string | number } & PagingQuery,
  ) =>
  () =>
    axios
      .get<Paginate<Entity>>(API + '/apollo/module/' + moduleName, { params })
      .then((r) => r.data)

export const batchDeleteEntities = (ids: string[] | string) =>
  axios
    .delete(API + '/apollo/module/entity/batch', {
      data: { ids: [ids].flat() },
    })
    .then((r) => r.data)

export const getEntity = (name: string, id: string, token?: string) => () => {
  return axios
    .get<Entity>(API + `/apollo/module/${name}/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
}

export const updateEntity = (moduleName: string, id: string) => (data: any) => {
  const { name, ...rest } = data
  return axios
    .patch<Entity>(API + `/apollo/module/${moduleName}/${id}`, {
      name,
      data: rest,
    })
    .then((res) => res.data)
}

export const getEntityForTaskCreate = (token?: string) => () =>
  axios
    .get<
      (Pick<Entity, 'id' | 'name'> & { module: Pick<Module, 'id' | 'name'> })[]
    >(API + '/apollo/module/entity/raw/create-task', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((r) => r.data)

export const getConvertableModules =
  (sourceName: string, token?: string) => () =>
    axios
      .get<Module[]>(API + `/apollo/module/${sourceName}/convertable_modules`, {
        headers: {
          authorization: 'Bearer ' + token,
        },
      })
      .then((r) => r.data)

export const convert =
  (sourceId: string) =>
  (data: { module_name: string; dto: Record<string, any> }[]) =>
    axios
      .put<Entity[]>(API + '/apollo/module/convert/' + sourceId, data)
      .then((res) => res.data)
