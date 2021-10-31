import { signIn, useSession } from 'next-auth/client'

export default function RequireLogin() {
  const [session, loading] = useSession()

  if (typeof window !== undefined && loading) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-content-center">
        Loading
      </div>
    )
  }
  if (!session) {
    signIn()
  }

  return <></>
}
