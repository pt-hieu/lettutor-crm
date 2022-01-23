import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Account } from '@utils/models/account'
import { Actions } from '@utils/models/role'
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

  const auth = useAuthorization()
  const isOwner = useOwnership(data)

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{fullName}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="flex flex-row gap-3">
          {(auth[Actions.Account.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS] || isOwner) && (
            <button
              className="crm-button-secondary"
              onClick={navigateToEditPage}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountDetailNavbar
