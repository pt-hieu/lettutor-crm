import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Deal } from '@utils/models/deal'
import { Actions } from '@utils/models/role'
import { useRouter } from 'next/router'

type Props = {
  deal: Deal
}

const DealDetailNavbar = ({ deal }: Props) => {
  const { id, fullName, amount } = deal

  const router = useRouter()
  const auth = useAuthorization()
  const isOwner = useOwnership(deal)

  const navigateToEditPage = () => {
    router.push(`/deals/${id}/edit`)
  }

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{`${fullName}`}</span>
          {amount && (
            <>
              <span>{`-`}</span>
              <span className="text-gray-500">{`$${amount}`}</span>
            </>
          )}
          <TraceInfo entity={deal} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(auth[Actions.VIEW_AND_EDIT_ALL_DEAL_DETAILS] || isOwner) && (
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

export default DealDetailNavbar
