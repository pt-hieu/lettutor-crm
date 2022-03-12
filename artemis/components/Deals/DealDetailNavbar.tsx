import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useMutation } from 'react-query'

import Confirm from '@utils/components/Confirm'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useCommand } from '@utils/hooks/useCommand'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Deal } from '@utils/models/deal'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/deal'

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

  const { mutateAsync, isLoading } = useMutation('delete-deal', batchDelete, {
    onSuccess() {
      router.push('/deals')
      notification.success({ message: 'Delete deal successfully' })
    },
    onError() {
      notification.error({ message: 'Delete deal unsuccessfully' })
    },
  })

  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  useCommand('cmd:delete-deal', () => {
    deleteButtonRef.current?.click()
  })

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
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

        <div className="grid grid-cols-2 gap-3">
          {(auth[Actions.Deal.DELETE_DEAL] || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([id || ''])}
              message="Are you sure you want to delete this deal?"
            >
              <button
                ref={deleteButtonRef}
                disabled={isLoading}
                className="crm-button-danger"
              >
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            </Confirm>
          )}

          {(auth[Actions.Deal.VIEW_AND_EDIT_ALL_DEAL_DETAILS] || isOwner) && (
            <button
              className="crm-button-secondary"
              onClick={navigateToEditPage}
            >
              <span className="fa fa-edit mr-2" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DealDetailNavbar
