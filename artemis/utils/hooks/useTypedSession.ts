import { JwtPayload } from "@utils/models/payload";
import { useSession } from "next-auth/client";

type UseSessionReturnType = [{ user: JwtPayload, exp?: any }, false] | [null, true]

export const useTypedSession = () => {
  const [session, loading] = useSession()

  return [session, loading] as UseSessionReturnType
}