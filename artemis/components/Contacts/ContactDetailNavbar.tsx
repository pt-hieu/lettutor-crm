import TraceInfo from '@utils/components/TraceInfo'
import { Contact } from '@utils/models/contact'
import { useRouter } from 'next/router'

type Props = {
  data: Contact | undefined
}

const ContactDetailNavbar = ({ data }: Props) => {
  const router = useRouter()
  const navigateToEditPage = () => {
    router.push(`/contacts/${data?.id}/edit`)
  }

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{data?.fullName}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="flex flex-row gap-3">
          <button className="crm-button">Send Email</button>
          <button className="crm-button-secondary" onClick={navigateToEditPage}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactDetailNavbar
