import { Avatar } from 'antd'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import { data } from '@utils/data/header-data'
import { useModal } from '@utils/hooks/useModal'
import { useTypedSession } from '@utils/hooks/useTypedSession'

import Confirm from './Confirm'
import Dropdown from './Dropdown'
import SettingMenu from './SettingMenu'

export const menuItemClass =
  'p-2 px-5 hover:bg-gray-200 hover:text-current w-full cursor-pointer crm-transition font-semibold text-gray-700'

export default function Header() {
  const [seed] = useState(Math.random())
  const { pathname } = useRouter()
  const [confirm, openConfirm, closeConfirm] = useModal()

  const [session] = useTypedSession()
  const splitPath = useMemo(() => pathname.split('/'), [pathname])

  return (
    <header className="z-[1000] crm-container sticky top-0 flex justify-between items-center h-[60px] shadow-md bg-white">
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
        <div className='font-medium mr-4'>
          Press <kbd className="p-1 border rounded-md">Ctrl</kbd> +{' '}
          <kbd className="p-1 border rounded-md">/</kbd> to open search box
        </div>

        <Dropdown triggerOnHover={false} overlay={<SettingMenu />}>
          <button className="text-blue-600 border border-blue-600 px-2 py-1.5 rounded-md">
            <span className="fa fa-cog mr-2" />
            Settings
          </button>
        </Dropdown>

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
