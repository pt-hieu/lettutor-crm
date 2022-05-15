import { signIn, useSession } from 'next-auth/client'

export default function RequireLogin() {
  const [session, loading] = useSession()

  if (typeof window !== undefined && loading) {
    return (
      <div className="min-h-screen grid place-content-center w-full">
        <div className="animate-pulse">
          <img
            className="w-[30%] mx-auto "
            src="/artemis_logo.png"
            alt="artemis logo"
          />
          <div className="text-center font-semibold mt-2 text-blue-600">
            The CRM
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    signIn()
  }

  return <></>
}
