import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useModal } from '@utils/hooks/useModal'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Lead } from '@utils/models/lead'
import { Actions } from '@utils/models/role'
import { useRouter } from 'next/router'
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

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <ConvertModal visible={convert} close={closeConvert} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{fullName}</span>
          <TraceInfo entity={lead} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button className="crm-button">Send Email</button>

          {(auth[Actions.VIEW_AND_CONVERT_LEAD_DETAILS] || isOwner) && (
            <button onClick={openConvert} className="crm-button-secondary">
              Convert
            </button>
          )}

          {(auth[Actions.VIEW_AND_EDIT_ALL_LEAD_DETAILS] || isOwner) && (
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
