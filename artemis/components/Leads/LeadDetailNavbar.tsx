import Confirm from '@utils/components/Confirm'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useModal } from '@utils/hooks/useModal'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Lead } from '@utils/models/lead'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/lead'
import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import ConvertModal from './ConvertModal'

type Props = {
  lead: Lead | undefined
}

const LeadDetailNavbar = ({ lead }: Props) => {
  const { fullName, id } = lead || {}
  const router = useRouter()

  const [convert, openConvert, closeConvert] = useModal()

  const auth = useAuthorization()
  const isOwner = useOwnership(lead)

  const navigateToEditPage = () => {
    router.push(`/leads/${id}/edit`)
  }

  const { mutateAsync, isLoading: isDeleting } = useMutation(
    'delete-lead',
    batchDelete,
    {
      onSuccess() {
        router.replace('/leads')
        notification.success({ message: 'Delete lead successfully' })
      },
      onError() {
        notification.error({ message: 'Delete lead unsuccessfully' })
      },
    },
  )

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
      <ConvertModal visible={convert} close={closeConvert} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{fullName}</span>
          <TraceInfo entity={lead} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {(auth[Actions.Lead.DELETE_LEAD] || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([id || ''])}
              message="Are you sure you want to delete this lead?"
            >
              <button disabled={isDeleting} className="crm-button-danger">
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            </Confirm>
          )}

          <button disabled className="crm-button">
            <span className="fa fa-envelope mr-2" />
            Send Email</button>

          {(auth[Actions.Lead.VIEW_AND_EDIT_ALL_LEAD_DETAILS] || isOwner) && (
            <button
              className="crm-button-secondary"
              onClick={navigateToEditPage}
            >
              <span className="fa fa-edit mr-2" /> Edit
            </button>
          )}

          {(auth[Actions.Lead.VIEW_AND_CONVERT_LEAD_DETAILS] || isOwner) && (
            <button onClick={openConvert} className="crm-button-secondary">
              <span className="fa fa-arrow-right mr-2" />
              Convert
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadDetailNavbar
