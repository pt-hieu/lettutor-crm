import jwt from 'jsonwebtoken'
import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'
import Providers from 'next-auth/providers'
import axios from 'axios'
import { asyncTryCatch } from '@utils/libs/functionalTryCatch'
import { API } from 'environment'

export default NextAuth({
  providers: [
    Providers.Credentials({
      id: 'login',
      name: 'Credentials',
      async authorize(credentials: Record<string, string>) {
        const [res] = await asyncTryCatch(() =>
          axios
            .post(`${API}/api/auth/validate`, {
              email: credentials.email,
              password: credentials.password,
            })
            .then((res) => res.data),
        )

        return res
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  session: {
    jwt: true,
    maxAge: 1 * 24 * 60 * 60, // 1 day in seconds
  },
  callbacks: {
    redirect(url) {
      return url
    },
    signIn() {
      return true
    },
    jwt(payload, user) {
      if (user) Object.assign(payload, user)
      return payload
    },
    session: async (session, user) => {
      Object.assign(session.user, user)
      return Promise.resolve(session)
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    encode: async (params) => {
      const secret = params?.secret || ''
      const token = params?.token as JWT

      const payload = Object.assign({}, token)

      const encodedToken = jwt.sign(payload, secret, {
        algorithm: 'HS256',
      })

      return encodedToken
    },

    decode: async (params) => {
      if (!params?.token) {
        return {}
      }

      const secret = params?.secret as string
      const decodedToken = jwt.verify(params?.token, secret, {
        algorithms: ['HS256'],
      }) as JWT

      return decodedToken
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  events: {},
  debug: false,
})
