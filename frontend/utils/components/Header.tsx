import { useTypedSession } from '@utils/hooks/useTypedSession'
import { Avatar } from 'antd'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import Confirm from './Confirm'
import { signOut } from 'next-auth/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useModal } from '@utils/hooks/useModal'
import Link from 'next/link'

const menuItemClass = 'p-2 px-3 hover:bg-gray-200 cursor-pointer crm-transition'

export default function Header() {
  const [session] = useTypedSession()
  const [seed] = useState(Math.random())
  const [visible, setVisible] = useState(false)
  const [confirm, openConfirm, closeConfirm] = useModal()

  const toggle = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setVisible((v) => !v)
  }, [])

  useEffect(() => {
    const close = () => setVisible(false)
    document.addEventListener('click', close)

    return () => {
      document.removeEventListener('click', close)
    }
  }, [])

  return (
    <header className="crm-container sticky top-0 flex justify-between items-center h-[60px] shadow-md">
      <div className="font-semibold text-xl">CRM System</div>
      <div className="flex gap-3 items-center relative">
        <div>Hi, {session?.user.name}</div>
        <button onClick={toggle}>
          <Avatar src={`https://avatars.dicebear.com/api/bottts/${seed}.svg`} />
        </button>

        <Confirm
          visible={confirm}
          close={closeConfirm}
          message="You are about to sign out"
          onYes={signOut}
        />

        <AnimatePresence exitBeforeEnter>
          {visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[120%] right-0 bg-white rounded-md shadow-md py-2 min-w-[150px] whitespace-nowrap"
            >
              <div className={menuItemClass}>
                <Link href="/change-password" passHref>
                  <div>
                    <span className=" fa fa-key mr-2" />
                    Change password
                  </div>
                </Link>
              </div>
              <div
                onClick={openConfirm}
                tabIndex={0}
                role="button"
                className={menuItemClass}
              >
                <span className="fa fa-sign-out-alt mr-2" />
                Sign Out
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
