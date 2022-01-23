import { useModal } from '@utils/hooks/useModal'
import { useSubscription } from '@utils/hooks/useSubscription'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { OpCode } from '@utils/models/subscription'
import { useCallback, useEffect, useRef } from 'react'
import Confirm from './Confirm'
import { signOut } from 'next-auth/client'

const LOG_OUT_TIMEOUT = 3000

export default function SessionInvalidate() {
  const [session] = useTypedSession()
  const [visible, open, close] = useModal()

  const data = useSubscription()

  useEffect(() => {
    if (!session || !data) return
    if (data.opcode !== OpCode.INVALIDATE_SESSION) return

    if (session.user.roles.some((role) => role.id === data.payload)) {
      open()
    }
  }, [data])

  const timeout = useRef<NodeJS.Timeout>()
  const throttledSignout = useCallback(() => {
    if (!timeout.current) {
      timeout.current = setTimeout(() => {
        timeout.current = undefined
        signOut()
      }, LOG_OUT_TIMEOUT)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    throttledSignout()
  }, [visible])

  return (
    <Confirm
      visible={visible}
      asInform
      onYes={close}
      close={close}
      message="Your session is expired. You are about to be signed out in 3 seconds."
      title="Session Invalidated"
    />
  )
}
