import Animate from '@utils/components/Animate'
import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import Link from 'next/link'
import { Lead } from '@utils/models/lead'
import { convertLead } from '@utils/service/lead'
import { Divider, Modal, notification, Switch } from 'antd'
import { useRouter } from 'next/router'
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'

interface Props {
  visible: boolean
  close: () => void
}

const accountItemClass = 'bg-gray-200 py-1 px-2 font-medium rounded-sm'

enum State {
  CONVERT = '1',
  SUCCEED = '2',
}

export default function ConvertModal({ close, visible }: Props) {
  const { query, push } = useRouter()
  const [convertToDeal, setConvertToDeal] = useState(false)
  const id = query.id as string

  const convertRef = useRef<HTMLDivElement>(null)
  const mutation = useRef<ResizeObserver | undefined>(undefined)
  const [height, setHeight] = useState<number | string>(400)

  useEffect(() => {
    if (mutation.current) {
      mutation.current.disconnect()
    }
    if (!convertRef.current) return

    let timeout: NodeJS.Timeout

    mutation.current = new ResizeObserver(([entry]) => {
      let height = (entry.target as HTMLDivElement).clientHeight
      if (height > 400) height = 400

      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        setHeight(height)
      }, 100)
    })
    mutation.current.observe(convertRef.current)
  }, [visible])

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm()

  useEffect(reset, [convertToDeal])

  const [state, setState] = useState<State>(State.CONVERT)

  const { data, mutateAsync, isLoading } = useMutation(
    ['convert', id],
    convertLead(id),
    {
      onSuccess() {
        setState(State.SUCCEED)
      },
      onError() {
        notification.error({ message: 'Convert unsuccessfully' })
      },
    },
  )

  const convert = useCallback(() => {
    mutateAsync()
  }, [])

  const closeOnState = useCallback(() => {
    if (state === State.SUCCEED) {
      push('/leads')
    }

    close
  }, [state])

  const { data: lead } = useQuery<Lead>(['lead', id], { enabled: false })
  const { fullName, owner } = lead || {}

  const renderState = useMemo(
    (): Record<State, ReactNode> => ({
      [State.CONVERT]: (
        <div ref={convertRef}>
          <div className="flex items-center w-auto gap-2">
            <div>Create New Account</div>
            <span className={accountItemClass}>{fullName} Account</span>
          </div>
          <div className="flex items-center w-auto gap-2 mt-2">
            <div>Create New Contact</div>
            <div className={accountItemClass}>{fullName}</div>
          </div>

          <div className="my-8">
            <div className="flex items-center">
              <Switch
                checked={convertToDeal}
                onChange={(v) => setConvertToDeal(v)}
              />
              <span
                className="cursor-default select-none ml-4"
                onClick={() => setConvertToDeal((v) => !v)}
              >
                Create a new Deal for this account
              </span>
            </div>

            <Animate
              shouldAnimateOnExit
              on={convertToDeal}
              transition={{ duration: 0.35 }}
              animation={{
                start: { opacity: 0, height: 0, marginTop: 0 },
                animate: {
                  opacity: 1,
                  height: 'auto',
                  marginTop: 8,
                },
                end: { opacity: 0, height: 0, marginTop: 0 },
              }}
              className="overflow-hidden"
            >
              <form className="border rounded-md p-4">
                <div className="mb-4">
                  <label htmlFor="amount" className="crm-label">
                    Amount
                  </label>
                  <Input
                    error=""
                    props={{
                      type: 'number',
                      id: 'amount',
                      className: 'w-full',
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="name" className="crm-label">
                    Deal Name
                  </label>
                  <Input
                    error=""
                    props={{
                      type: 'text',
                      id: 'name',
                      className: 'w-full',
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="date" className="crm-label">
                    Closing Date
                  </label>
                  <Input
                    error=""
                    props={{
                      type: 'date',
                      id: 'date',
                      className: 'w-full',
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="stage" className="crm-label">
                    Stage
                  </label>
                  <Input
                    error=""
                    as="select"
                    props={{
                      id: 'stage',
                      className: 'w-full',
                    }}
                  />
                </div>
              </form>
            </Animate>
          </div>

          <div>
            Owner of the new records:{' '}
            <span className="font-medium">{owner?.name}</span>
          </div>
        </div>
      ),
      [State.SUCCEED]: (
        <Animate
          transition={{ duration: 0.15, delay: 0.2 }}
          animation={{
            start: { height },
            animate: { height: 'auto' },
          }}
        >
          <div>
            The lead <span className="font-medium">{fullName}</span> has been
            successfully converted.
          </div>
          <div className="mb-2 mt-4 font-semibold">Details</div>

          <div className="flex flex-col gap-2">
            {/* Fixme */}
            {/* @ts-ignore */}
            {data?.map(({ id, name }) => (
              <Link href="" key={id}>
                <a className="crm-link underline hover:underline">{name}</a>
              </Link>
            ))}
          </div>
        </Animate>
      ),
    }),
    [fullName, owner?.name, convertToDeal, data, height],
  )

  return (
    <Modal
      visible={visible}
      onCancel={closeOnState}
      centered
      footer={
        <div className="flex w-full gap-2 justify-end">
          <Animate
            shouldAnimateOnExit
            on={state === State.CONVERT}
            animation={{
              start: { opacity: 1 },
              animate: { opacity: 1 },
              end: { opacity: 0 },
            }}
          >
            <button
              onClick={convert}
              disabled={isLoading}
              className="crm-button"
            >
              <Loading on={isLoading}>Submit</Loading>
            </button>
          </Animate>
          <button onClick={closeOnState} className="crm-button-outline">
            {state === State.CONVERT ? 'Cancel' : 'Close'}
          </button>
        </div>
      }
    >
      <div className="flex gap-2 items-center">
        <div className="font-medium text-[17px]">Convert Lead</div>
        <div>
          ({fullName} - {`${fullName} Account`})
        </div>
      </div>

      <Divider />

      <div className="max-h-[400px] overflow-y-auto overflow-x-hidden crm-scrollbar pr-2">
        <Animate
          presenceProps={{ exitBeforeEnter: true, presenceAffectsLayout: true }}
          shouldAnimateOnExit
          on={state}
          transition={{ duration: 0.3 }}
          animation={{
            start: {
              opacity: 0,
              transform: 'translateX(14px)',
            },
            animate: {
              opacity: 1,
              transform: 'translateX(0px)',
            },
            end: {
              opacity: 0,
              transform: 'translateX(-14px)',
            },
          }}
        >
          {renderState[state]}
        </Animate>
      </div>
    </Modal>
  )
}
