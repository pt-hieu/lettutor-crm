import axios from 'axios'
import { API } from 'environment'
import FileSaver from 'file-saver'

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

export const importModule = (moduleName: string) => (file: File) => {
  const formData = new FormData()
  formData.append('files', file)
  return axios.post(API + `/apollo/module/${moduleName}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const downloadTemplate = (moduleName: string) => () => {
  axios
    .get(API + `/apollo/module/${moduleName}/template/xlsx`, {
      responseType: 'stream',
    })
    .then((res: any) => {
      downloadFile(res.data, `import_${moduleName}_template.xlsx`)
    })
}
export const exportModuleEntities = (moduleName: string) => () => {
  axios
    .get(API + `/apollo/module/${moduleName}/export/xlsx`, {
      responseType: 'stream',
    })
    .then((res: any) => {
      downloadFile(res.data, `import_${moduleName}_template.xlsx`)
    })
}

function base64toBlob(base64Data: string, contentType: string) {
  contentType = contentType || ''
  let sliceSize = 1024
  let byteCharacters = atob(base64Data)
  let bytesLength = byteCharacters.length
  let slicesCount = Math.ceil(bytesLength / sliceSize)
  let byteArrays = new Array(slicesCount)
  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    let begin = sliceIndex * sliceSize
    let end = Math.min(begin + sliceSize, bytesLength)

    let bytes = new Array(end - begin)
    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: contentType })
}

function downloadFile(blobContent: string, fileName: string) {
  let blob = new Blob(
    [
      base64toBlob(
        blobContent,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ],
    {},
  )
  FileSaver.saveAs(blob, fileName)
}
