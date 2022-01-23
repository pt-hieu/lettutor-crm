import moment from 'moment'

export const formatDate = (date: Date | null) => {
  return date !== null ? moment(date).format('MM/DD/YYYY') : ''
}
