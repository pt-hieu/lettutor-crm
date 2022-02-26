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
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <ConvertModal visible={convert} close={closeConvert} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{fullName}</span>
          <TraceInfo entity={lead} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {(auth[Actions.Lead.DELETE_LEAD] || isOwner) && (
            <button
              disabled={isDeleting}
              onClick={() => mutateAsync([id || ''])}
              className="crm-button-danger"
            >
              <span className="fa fa-trash mr-2" />
              Delete
            </button>
          )}

          <button className="crm-button">Send Email</button>

          {(auth[Actions.Lead.VIEW_AND_CONVERT_LEAD_DETAILS] || isOwner) && (
            <button onClick={openConvert} className="crm-button-secondary">
              Convert
            </button>
          )}

          {(auth[Actions.Lead.VIEW_AND_EDIT_ALL_LEAD_DETAILS] || isOwner) && (
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

export default LeadDetailNavbar
