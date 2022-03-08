import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'

import Confirm from '@utils/components/Confirm'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Account } from '@utils/models/account'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/account'

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

  const { mutateAsync, isLoading } = useMutation(
    'delete-accounts',
    batchDelete,
    {
      onSuccess() {
        router.push('/accounts')
        notification.success({ message: 'Delete accounts successfully' })
      },
      onError() {
        notification.error({ message: 'Delete accounts unsuccessfully' })
      },
    },
  )
  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{fullName}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(auth[Actions.Account.DELETE_ACCOUNT] || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([id || ''])}
              message="Are you sure you want to delete this account?"
            >
              <button disabled={isLoading} className="crm-button-danger">
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            </Confirm>
          )}

          {(auth[Actions.Account.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS] ||
            isOwner) && (
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

export default AccountDetailNavbar
