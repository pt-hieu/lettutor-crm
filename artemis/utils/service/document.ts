import { IDocument, IDocumentCategory } from '@utils/models/document'
import { Paginate } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getDocuments = (token?: string) => () =>
  axios
    .get<Paginate<IDocument>>(API + '/poseidon/documents', {
      params: {
        populate: '*',
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const getDocumentCategories = (slug: string) => () => {
  return axios
    .get<Paginate<IDocumentCategory>>(API + '/poseidon/document-categories?', {
      params: {
        populate: '*',
      },
    })
    .then((r) => r.data.items.filter((item) => item.slug === slug)[0])
}
