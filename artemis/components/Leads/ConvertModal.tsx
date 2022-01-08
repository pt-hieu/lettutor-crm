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
import { Deal, DealStage } from '@utils/models/deal'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useInput } from '@utils/hooks/useInput'
import { getUsers } from '@utils/service/user'
import { User } from '@utils/models/user'

interface Props {
  visible: boolean
  close: () => void
}

const accountItemClass = 'bg-gray-200 py-1 px-2 font-medium rounded-sm'

enum State {
  CONVERT = '1',
  SUCCEED = '2',
}

const linkMapping = {
  0: '/accounts/',
  1: '/contacts/',
  2: '/deals/',
}

const labelMapping = {
  0: 'Account: ',
  1: 'Contact: ',
  2: 'Deal: ',
}

type FormData = {} & Pick<Deal, 'amount' | 'closingDate' | 'fullName' | 'stage'>

const schema = yup.object().shape({
  amount: yup.number().typeError('Invalid amount'),
  closingDate: yup.date().typeError('Invalid date'),
  fullName: yup.string().max(100, 'Name has to be at most 100 characters'),
  stage: yup.string(),
})

export default function ConvertModal({ close, visible }: Props) {
  const { query, push } = useRouter()
  const id = query.id as string

  const { data: lead } = useQuery<Lead>(['lead', id], { enabled: false })
  const { fullName, owner } = lead || {}

  const [convertToDeal, setConvertToDeal] = useState(false)

  const convertRef = useRef<HTMLDivElement>(null)
  const mutation = useRef<ResizeObserver | undefined>(undefined)
  const [height, setHeight] = useState<number | string>(400)

  const { data: users } = useQuery(
    'users',
    getUsers({ shouldNotPaginate: true }),
    {
      enabled: visible,
    },
  )
  const [ownerId, changeOwnerId] = useInput(lead?.owner?.id)
  const [error, setError] = useState<'Owner is required.'>()

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
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: fullName + ' Account',
    },
  })

  useEffect(reset, [convertToDeal])

  const [state, setState] = useState<State>(State.CONVERT)

  const { data, mutateAsync, isLoading } = useMutation(
    ['convert', id],
    convertLead(id, ownerId),
    {
      onSuccess() {
        setState(State.SUCCEED)
      },
      onError() {
        notification.error({ message: 'Convert unsuccessfully' })
      },
    },
  )

  const convert = useCallback(
    handleSubmit((data) => {
      if (!ownerId) {
        setError('Owner is required.')
        return
      } else {
        setError(undefined)
      }

      mutateAsync(convertToDeal ? data : undefined)
    }),
    [convertToDeal, ownerId],
  )

  const closeOnState = useCallback(() => {
    if (state === State.SUCCEED) {
      push('/leads')
    }

    close()
  }, [state])

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
                    error={errors.amount?.message}
                    props={{
                      type: 'number',
                      id: 'amount',
                      className: 'w-full',
                      ...register('amount', {
                        setValueAs: (v: string) => Number(v),
                      }),
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="name" className="crm-label">
                    Deal Name
                  </label>
                  <Input
                    error={errors.fullName?.message}
                    props={{
                      type: 'text',
                      id: 'name',
                      className: 'w-full',
                      ...register('fullName'),
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="date" className="crm-label">
                    Closing Date
                  </label>
                  <Input
                    error={errors.closingDate?.message}
                    props={{
                      type: 'date',
                      id: 'date',
                      className: 'w-full',
                      ...register('closingDate'),
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="stage" className="crm-label">
                    Stage
                  </label>
                  <Input
                    error={errors.stage?.message}
                    as="select"
                    props={{
                      id: 'stage',
                      className: 'w-full',
                      ...register('stage'),
                      children: (
                        <>
                          {Object.values(DealStage).map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </>
                      ),
                    }}
                  />
                </div>
              </form>
            </Animate>
          </div>

          <div className="flex gap-2 items-center">
            <span>Owner of the new records:</span>
            <Input
              error={error}
              as="select"
              props={{
                value: ownerId,
                onChange: changeOwnerId,
                children: (
                  <>
                    {(users as unknown as User[]).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
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
            {data?.map(
              (entity, index) =>
                entity && (
                  <span>
                    {labelMapping[index as 0 | 1 | 2]}
                    <Link
                      href={linkMapping[index as 0 | 1 | 2] + entity.id}
                      key={entity.id}
                    >
                      <a className="crm-link underline hover:underline">
                        {entity.fullName}
                      </a>
                    </Link>
                  </span>
                ),
            )}
          </div>
        </Animate>
      ),
    }),
    [fullName, owner?.name, convertToDeal, data, height, errors, ownerId],
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
