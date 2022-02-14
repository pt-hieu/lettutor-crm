import axios from 'axios'
import { API } from 'environment'

export const createBug = (data: any) =>
  axios.post(API + '/poseidon/bugs', { data }).then((res) => res.data)
