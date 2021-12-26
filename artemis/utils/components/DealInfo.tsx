import { Deal } from '@utils/models/deal'
import moment from 'moment'
import Link from 'next/link'

type Props = Pick<Deal, 'id' | 'fullName' | 'amount' | 'stage' | 'closingDate'>

export default function DealInfo({
  id,
  fullName,
  amount,
  stage,
  closingDate,
}: Props) {
  return (
    <>
      <p className="font-semibold">
        <Link href={`/deals/${id}`}>
          <a className=" text-gray-700 hover:text-gray-600">{fullName}</a>
        </Link>
        <span className="bg-red-400 px-2 ml-4 text-white rounded-sm">
          $ {amount}
        </span>
      </p>
      <p>
        <span>{stage}</span>
        <span className="ml-4">{moment(closingDate).format('DD/MM/YYYY')}</span>
      </p>
    </>
  )
}
