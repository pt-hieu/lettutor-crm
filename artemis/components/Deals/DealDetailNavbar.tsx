import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Deal } from '@utils/models/deal'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/deal'
import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

type Props = {
  deal: Deal
}

const DealDetailNavbar = ({ deal }: Props) => {
  const { id, fullName, amount } = deal

  const router = useRouter()
  const auth = useAuthorization()
  const isOwner = useOwnership(deal)
  const client = useQueryClient()

  const navigateToEditPage = () => {
    router.push(`/deals/${id}/edit`)
  }

  const { mutateAsync, isLoading } = useMutation('delete-deal', batchDelete, {
    onSuccess() {
      router.push('/deals')
      notification.success({ message: 'Delete deal successfully' })
    },
    onError() {
      notification.error({ message: 'Delete deal unsuccessfully' })
    },
  })

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
          {(auth[Actions.Deal.DELETE_DEAL] || isOwner) && (
            <button
              disabled={isLoading}
              onClick={() => mutateAsync([id || ''])}
              className="crm-button-danger"
            >
              <span className="fa fa-trash mr-2" />
              Delete
            </button>
          )}

          {(auth[Actions.Deal.VIEW_AND_EDIT_ALL_DEAL_DETAILS] || isOwner) && (
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
