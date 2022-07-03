import Router from 'next/router'
import { useEffect, useState } from 'react'

const useUnsavedChanges = (
  confirmationMessage = 'Changes you made may not be saved',
) => {
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      ;(e || window.event).returnValue = confirmationMessage
      return confirmationMessage
    }
    const beforeRouteHandler = (url: string) => {
      if (Router.pathname !== url && !confirm(confirmationMessage)) {
        Router.events.emit('routeChangeError')
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`
      }
    }
    if (isDirty) {
      window.addEventListener('beforeunload', beforeUnloadHandler)
      Router.events.on('routeChangeStart', beforeRouteHandler)
    } else {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      Router.events.off('routeChangeStart', beforeRouteHandler)
    }
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      Router.events.off('routeChangeStart', beforeRouteHandler)
    }
  }, [isDirty])

  return [() => setIsDirty(true), () => setIsDirty(false)]
}

export default useUnsavedChanges
