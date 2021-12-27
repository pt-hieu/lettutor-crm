import { Avatar, Tooltip } from 'antd'
import { MouseEvent, useCallback, useEffect, useState, useMemo } from 'react'
import Confirm from './Confirm'
import { signOut } from 'next-auth/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useModal } from '@utils/hooks/useModal'
import { data } from '@utils/data/header-data'
import Link from 'next/link'
import { useRouter } from 'next/router'

export const menuItemClass =
  'p-2 px-5 hover:bg-gray-200 hover:text-current w-full cursor-pointer crm-transition font-semibold text-gray-700'

const activeLink =
  'before:content before:absolute before:top-[101%] before:w-full before:bg-blue-600 before:h-[3px] text-blue-600'

export default function Header() {
  const [seed] = useState(Math.random())
  const { pathname } = useRouter()
  const [visible, setVisible] = useState(false)
  const [confirm, openConfirm, closeConfirm] = useModal()

  const splitPath = useMemo(() => pathname.split('/'), [pathname])

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
    <header className="z-[100] crm-container sticky top-0 flex justify-between items-center h-[60px] shadow-md bg-white">
      <div className="flex">
        <Link href="/">
          <a className="font-semibold text-xl !text-blue-600 crm-link">CRM System</a>
        </Link>
        <span className="ml-12 flex gap-6">
          {data.map(({ link, title }) => (
            <Link href={link} key={link}>
              <a
                className={`relative crm-link leading-[28px] whitespace-nowrap ${
                  link === `/${splitPath[1]}` ? activeLink : ''
                }`}
              >
                {title}
              </a>
            </Link>
          ))}
        </span>
      </div>

      <div className="flex gap-3 items-center relative z-20">
        <div>
          <Link href="/settings">
            <a className="crm-link">
              <Tooltip title="Settings">
                <span className="fa fa-cog" />
              </Tooltip>
            </a>
          </Link>
        </div>
        <span>|</span>
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
              className="absolute border top-[120%] right-0 bg-white rounded-md shadow-md py-2 min-w-[150px] whitespace-nowrap flex flex-col h-auto"
            >
              <Link href="/change-password">
                <a className={menuItemClass}>
                  <span className="fa fa-key mr-2" />
                  Change password
                </a>
              </Link>

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
