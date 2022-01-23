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
      .get<Paginate<Contact>>(API + '/api/contact', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getRawContacts = (token?: string) => () =>
  axios
    .get<Pick<Contact, 'id' | 'fullName'>>(API + '/api/contact/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const getContact = (id?: string, token?: string) => () =>
  axios
    .get<Contact>(API + `/api/contact/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const updateContact = async (params: {
  id: string
  contactInfo: ContactAddFormData
}) => {
  const { id, contactInfo } = params
  const { data } = await axios.patch<Contact>(
    API + `/api/contact/${id}`,
    contactInfo,
  )

  return data
}

export const addContact = async (contactInfo: ContactAddFormData) => {
  const { data } = await axios.post<Contact>(API + `/api/contact`, contactInfo)
  return data
}
