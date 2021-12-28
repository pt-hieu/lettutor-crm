import Link from 'next/link'
import { Base } from '@utils/models/base'
import moment from 'moment'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

type Props = {
  entity: Base | undefined
} & DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function TraceInfo({ entity, ...props }: Props) {
  const { createdBy, createdAt, updatedBy, updatedAt } = entity || {}

  return (
    <button
      {...props}
      className={'relative text-white group ' + props.className}
    >
      <span className="grid place-content-center w-5 h-5 rounded-full bg-blue-600 group-focus:ring-1 group-hover:ring-1 ring-blue-400 crm-transition">
        <span className="fa fa-info text-[12px]" />
      </span>

      <div className="cursor-default absolute top-[120%] opacity-0 group-hover:opacity-100 min-w-[350px] group-focus:opacity-100 crm-transition bg-blue-600 border rounded-md p-2">
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
        {!updatedBy && !createdBy && <div>There is no information found!</div>}
      </div>
    </button>
  )
}
