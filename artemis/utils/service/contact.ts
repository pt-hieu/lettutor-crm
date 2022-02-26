import { Contact } from '@utils/models/contact'
import { LeadSource } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'
import { ContactAddFormData } from 'pages/contacts/add-contact'

export const getContacts =
  (
    params: {
      search?: string
      source?: LeadSource[]
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Contact>>(API + '/apollo/contact', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getRawContacts = (token?: string) => () =>
  axios
    .get<Pick<Contact, 'id' | 'fullName'>>(API + '/apollo/contact/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const getContact = (id?: string, token?: string) => () =>
  axios
    .get<Contact>(API + `/apollo/contact/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const updateContact = async (params: {
  id: string
  contactInfo: ContactAddFormData
}) => {
  const { id, contactInfo } = params
  const { data } = await axios.patch<Contact>(
    API + `/apollo/contact/${id}`,
    contactInfo,
  )

  return data
}

export const addContact = async (contactInfo: ContactAddFormData) => {
  const { data } = await axios.post<Contact>(
    API + `/apollo/contact`,
    contactInfo,
  )
  return data
}

export const batchDelete = (ids: string[]) =>
  axios
    .delete(API + '/apollo/contact/batch', { data: { ids } })
    .then((r) => r.data)
