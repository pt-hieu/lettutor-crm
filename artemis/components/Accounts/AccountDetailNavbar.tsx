import TraceInfo from '@utils/components/TraceInfo'
import { Account } from '@utils/models/account'
import { useRouter } from 'next/router'

type Props = {
  data: Account | undefined
}

const AccountDetailNavbar = ({ data }: Props) => {
  const { fullName, id } = data || {}

  const router = useRouter()
  const navigateToEditPage = () => {
    router.push(`/accounts/${id}/edit`)
  }
  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{fullName}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="flex flex-row gap-3">
          <button className="crm-button-secondary" onClick={navigateToEditPage}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountDetailNavbar
