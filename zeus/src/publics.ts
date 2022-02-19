import { TMethod } from './app.service'

export type TPublicRoute = {
  method: TMethod
  value: string
}

export const PUBLIC_ROUTES: TPublicRoute[] = [
  {
    value: '/apollo/auth/validate',
    method: 'post',
  },
  {
    value: '/apollo/auth/signup',
    method: 'post',
  },

  {
    value: '/apollo/user/reset-password',
    method: 'post',
  },
  {
    value: '/apollo/user/validate-token',
    method: 'get',
  },
  {
    value: '/apollo/user/password',
    method: 'put',
  },

  {
    value: '/apollo/webhook',
    method: 'get',
  },
  {
    value: '/apollo/webhook',
    method: 'post',
  },
  {
    value: '/apollo/webhook/strapi',
    method: 'post',
  },
  {
    value: '/events',
    method: 'post',
  },
  {
    value: '/poseidon/documents',
    method: 'get',
  },
]
