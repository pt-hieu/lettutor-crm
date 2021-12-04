import { Lead } from '@utils/models/lead'
import { useRouter } from 'next/router'

type Props = {
  lead: Lead
}

const LeadDetailNavbar = ({ lead: { fullName, id } }: Props) => {
  const router = useRouter()

  const navigateToEditPage = () => {
    router.push(`/leads/${id}/edit`)
  }

  return (
    <div className="mb-4 border-b pb-4 sticky top-[76px] bg-white z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-gray-300 w-10 h-10 rounded-full mr-3" />
          <span className="font-semibold">{fullName}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button className="crm-button">Send Email</button>
          <button className="crm-button-secondary">Convert</button>
          <button className="crm-button-secondary" onClick={navigateToEditPage}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailNavbar
