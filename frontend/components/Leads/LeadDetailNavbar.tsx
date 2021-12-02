import Loading from '@utils/components/Loading'
import { Lead } from '@utils/models/lead'

type Props = {
  isLoading: boolean
  lead?: Lead
}

const LeadDetailNavbar = ({ isLoading, lead }: Props) => {
  return (
    <div className="border">
      <div className="crm-container flex justify-between items-center h-[80px]">
        <Loading on={isLoading}>
          <div className="flex items-center">
            <div className="bg-gray-300 w-10 h-10 rounded-full mr-3"></div>
            <span className="font-semibold">{lead?.fullName}</span>
          </div>
        </Loading>
        <div className="grid grid-cols-3 gap-3">
          <button className="crm-button">Send Email</button>
          <button className="crm-button-secondary">Convert</button>
          <button className="crm-button-secondary">Edit</button>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailNavbar
