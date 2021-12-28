import Link from 'next/link'
import { Base } from '@utils/models/base'
import moment from 'moment'
import { DetailedHTMLProps, HTMLAttributes, useState } from 'react'
import Animate from './Animate'

type Props = {
  entity: Base | undefined
} & DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function TraceInfo({ entity, ...props }: Props) {
  const { createdBy, createdAt, updatedBy, updatedAt } = entity || {}
  const [hover, setHover] = useState(false)

  return (
    <button
      {...props}
      className={'relative text-white group ' + props.className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <span className="grid place-content-center w-5 h-5 rounded-full bg-blue-600 group-focus:ring-1 ring-blue-400 crm-transition">
        <span className="fa fa-info text-[12px]" />
      </span>

      <Animate
        shouldAnimateOnExit
        presenceProps={{ exitBeforeEnter: true }}
        transition={{ duration: 0.2 }}
        on={hover}
        animation={{
          start: { opacity: 0 },
          animate: { opacity: 1 },
          end: { opacity: 0 },
        }}
      >
        <div className="cursor-default absolute top-[120%] min-w-[350px] bg-blue-600 border rounded-md p-2">
          {createdBy && (
            <div className="text-left">
              <span className="fa fa-history mr-2" />
              Created by{' '}
              <Link href="">
                <a className="underline hover:underline crm-link text-white hover:text-white">
                  {createdBy.name}
                </a>
              </Link>{' '}
              at {moment(createdAt).format('HH:mm A DD/MM/YYYY')}
            </div>
          )}

          {updatedBy && (
            <div className="text-left">
              <span className="fa fa-history mr-2" />
              Updated by{' '}
              <Link href="">
                <a className="underline hover:underline crm-link text-white hover:text-white">
                  {updatedBy.name}
                </a>
              </Link>{' '}
              at {moment(updatedAt).format('HH:mm A DD/MM/YYYY')}
            </div>
          )}
          {!updatedBy && !createdBy && (
            <div>There is no information found!</div>
          )}
        </div>
      </Animate>
    </button>
  )
}
