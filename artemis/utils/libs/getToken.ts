import { NextApiRequestCookies } from "next/dist/server/api-utils";

export function getSessionToken(cookies: NextApiRequestCookies) {
  return (
    cookies['next-auth.session-token'] ||
    cookies['__Secure-next-auth.session-token']
  )
}