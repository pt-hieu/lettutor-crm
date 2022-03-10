import { Divider, Modal } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import { useKey } from 'react-use'

import { Command, Module, commands } from '@utils/data/search'
import { useCommand } from '@utils/hooks/useCommand'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { Deal } from '@utils/models/deal'
import { Lead } from '@utils/models/lead'
import { Task } from '@utils/models/task'
import { getRawAccounts } from '@utils/service/account'
import { getRawContacts } from '@utils/service/contact'
import { getRawDeals } from '@utils/service/deal'
import { getRawLeads } from '@utils/service/lead'
import { getRawTasks } from '@utils/service/task'

import Input from './Input'

const moduleMapping = {
  [Module.ACCOUNT]: getRawAccounts(),
  [Module.CONTACT]: getRawContacts(),
  [Module.DEAL]: getRawDeals(),
  [Module.LEAD]: getRawLeads(),
  [Module.TASK]: getRawTasks(),
}

type TProps = {
  visible: boolean
  close: () => void
}

type FormData = {
  q: string
}

export default function Search({ close, visible }: TProps) {
  const client = useQueryClient()
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      q: '',
    },
  })

  useCommand('cmd:close-search', () => {
    close()
  })

  const [filterCommands, setCommands] = useState<Command[]>([])

  useEffect(() => {
    const subs = watch(() => {
      handleSubmit(async ({ q }) => {
        if (q.startsWith('>')) {
          setCommands(
            commands.filter((cmd) =>
              cmd.content
                .toLocaleLowerCase()
                .includes(q.replace('>', '').trim().toLocaleLowerCase()),
            ),
          )
          return
        }

        for await (const module of Object.values(Module)) {
          const pattern = '#' + module
          if (q.startsWith(pattern)) {
            return
          }
        }

        setCommands([])
      })()
    })

    return subs.unsubscribe
  }, [watch])

  useEffect(() => {
    if (!visible) return

    unstable_batchedUpdates(() => {
      setValue('q', '')
      setCommands([])
    })
  }, [visible])

  return (
    <Modal
      visible={visible}
      centered
      onCancel={close}
      closable={false}
      footer={null}
    >
      <form
        className="grid grid-cols-[1fr,18fr,1fr] gap-2 items-center w-full"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <span className="fa fa-search text-center" />

        <Input
          showError={false}
          props={{
            type: 'text',
            className: 'w-full !ring-0',
            placeholder: 'Search Artemis',
            autoFocus: true,
            ...register('q'),
          }}
        />

        <button
          type="button"
          className="fa fa-times text-center p-2 px-3 border rounded-md"
          onClick={close}
        />
      </form>

      <Divider />

      {!!filterCommands.length && <SearchList result={filterCommands} />}
    </Modal>
  )
}

type SearchListProps<T> = {
  result: T[]
}

function SearchList<
  T extends Command | Deal | Task | Account | Lead | Contact,
>({ result }: SearchListProps<T>) {
  const commandContainerRef = useRef<HTMLDivElement>(null)

  useKey(
    'ArrowDown',
    () => {
      const activeElement = document.activeElement
      if (activeElement?.tagName !== 'BUTTON') {
        const commandContainer = commandContainerRef.current
        ;(commandContainer?.firstElementChild as HTMLButtonElement)?.focus()

        return
      }

      ;(activeElement?.nextSibling as HTMLButtonElement)?.focus()
    },
    { event: 'keydown' },
  )

  useKey(
    'ArrowUp',
    () => {
      const activeElement = document.activeElement
      if (activeElement?.tagName !== 'BUTTON') {
        const commandContainer = commandContainerRef.current
        ;(commandContainer?.lastElementChild as HTMLButtonElement)?.focus()

        return
      }

      ;(activeElement?.previousSibling as HTMLButtonElement)?.focus()
    },
    { event: 'keydown' },
  )

  useKey(
    'Enter',
    (e) => {
      const activeElement = document.activeElement
      if (activeElement?.tagName !== 'INPUT') return

      e.preventDefault()

      const commandContainer = commandContainerRef.current
      ;(commandContainer?.firstElementChild as HTMLButtonElement)?.focus()
    },
    { event: 'keydown' },
  )

  return (
    <div ref={commandContainerRef} className="flex flex-col gap-2">
      {result.map((item) =>
        'content' in item ? (
          <CommandComponent key={item.action} command={item} />
        ) : (
          // @ts-ignore
          <div>{item.fullName}</div>
        ),
      )}
    </div>
  )
}

function CommandComponent({
  command: { action, content },
}: {
  command: Command
}) {
  const { query } = useRouter()
  const client = useQueryClient()

  const isNotAvailable = useMemo(
    () => !query.id && /\[\]|cmd:/.test(action),
    [query],
  )

  const [link, setLink] = useState<string>()

  useEffect(() => {
    if (action.startsWith('cmd:')) return
    if (action.includes('[]')) {
      setLink(action.replace('[]', query.id as string))
      return
    }

    setLink(action)
  }, [])

  const onCommandClick = useCallback(() => {
    client.setQueryData(action, Date.now())
    client.setQueryData('cmd:close-search', Date.now())
  }, [])

  if (isNotAvailable) return null
  return link ? (
    <Link href={link} passHref>
      <button className="text-left border rounded-md px-3 py-2 focus:border-blue-600 focus:border focus-visible:border-blue-600 focus-within:border disabled:bg-gray-200">
        <a className="hover:text-current">{content}</a>
      </button>
    </Link>
  ) : (
    <button
      onClick={onCommandClick}
      className="text-left border rounded-md px-3 py-2 focus:border-blue-600 focus:border focus-visible:border-blue-600 focus-within:border disabled:bg-gray-200"
    >
      {content}
    </button>
  )
}
