import { Avatar } from 'antd'
import { MouseEvent, useCallback, useEffect, useState, useMemo } from 'react'
import Confirm from './Confirm'
import { signOut } from 'next-auth/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useModal } from '@utils/hooks/useModal'
import { data } from '@utils/data/header-data'
import Link from 'next/link'
import { useRouter } from 'next/router'
import SettingMenu from './SettingMenu'
import useGlobalDate from '@utils/hooks/useGlobalDate'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import Dropdown from './Dropdown'

export const menuItemClass =
  'p-2 px-5 hover:bg-gray-200 hover:text-current w-full cursor-pointer crm-transition font-semibold text-gray-700'

export default function Header() {
  const [seed] = useState(Math.random())
  const { pathname } = useRouter()
  const [visible, setVisible] = useState(false)
  const [confirm, openConfirm, closeConfirm] = useModal()

  const [session] = useTypedSession()
  const splitPath = useMemo(() => pathname.split('/'), [pathname])

  const { effect } = useGlobalDate({
    callback: () => {
      setVisible(false)
    },
  })

  useEffect(() => {
    if (!visible) return
    effect()
  }, [visible])

  const toggle = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setVisible((v) => !v)
  }, [])

  useEffect(() => {
    const close = () => {
      setVisible(false)
    }

    document.addEventListener('click', close)
    return () => {
      document.removeEventListener('click', close)
    }
  }, [])

  return (
    <header className="z-[100] crm-container sticky top-0 flex justify-between items-center h-[60px] shadow-md bg-white">
      <div className="flex">
        <Link href="/">
          <a className="font-semibold text-xl !text-blue-600 crm-link">
            Artemis CRM
          </a>
        </Link>

        <div className="ml-12 flex gap-6">
          {data.map(({ link, title }) => (
            <Link href={link} key={link}>
              <a
                className={`relative crm-link font-medium leading-[28px] whitespace-nowrap ${
                  link === `/${splitPath[1]}` ? 'text-blue-600' : ''
                }`}
              >
                {title}

                {link === `/${splitPath[1]}` && (
                  <motion.span
                    layoutId="underline"
                    className="absolute top-[101%] left-0 rounded-md w-full bg-blue-600 h-[3px]"
                  />
                )}
              </a>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-3 items-center relative z-20">
        <div className="relative">
          <Dropdown triggerOnHover={false} overlay={<SettingMenu />}>
            <button className="text-blue-600 border border-blue-600 px-2 py-1.5 rounded-md">
              <span className="fa fa-cog mr-2" />
              Settings
            </button>
          </Dropdown>
        </div>

        <span>|</span>

        <Dropdown
          triggerOnHover={false}
          overlay={
            <div className="border bg-white rounded-md shadow-md py-2 min-w-[150px] whitespace-nowrap flex flex-col h-auto">
              <div
                className={
                  menuItemClass +
                  ' border-b-[1.5px] cursor-default hover:bg-white'
                }
              >
                <span className="fa fa-user mr-2" />
                {session?.user.name}
              </div>

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
            </div>
          }
        >
          <Avatar
            className="cursor-pointer"
            src={`https://avatars.dicebear.com/api/bottts/${seed}.svg`}
          />
        </Dropdown>

        <Confirm
          visible={confirm}
          close={closeConfirm}
          message="You are about to sign out"
          onYes={signOut}
        />
      </div>
    </header>
  )
}
