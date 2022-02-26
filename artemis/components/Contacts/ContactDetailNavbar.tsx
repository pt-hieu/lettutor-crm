import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Contact } from '@utils/models/contact'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/contact'
import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'

type Props = {
  data: Contact | undefined
}

const ContactDetailNavbar = ({ data }: Props) => {
  const router = useRouter()

  const navigateToEditPage = () => {
    router.push(`/contacts/${data?.id}/edit`)
  }

  const auth = useAuthorization()
  const isOwner = useOwnership(data)

  const { mutateAsync, isLoading } = useMutation(
    'delete-contacts',
    batchDelete,
    {
      onSuccess() {
        router.push('/contacts')
        notification.success({ message: 'Delete contact successfully' })
      },
      onError() {
        notification.error({ message: 'Delete contact unsuccessfully' })
      },
    },
  )

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{data?.fullName}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(auth[Actions.Contact.DELETE_CONTACT] || isOwner) && (
            <button
              disabled={isLoading}
              onClick={() => mutateAsync([data?.id || ''])}
              className="crm-button-danger"
            >
              <span className="fa fa-trash mr-2" />
              Delete
            </button>
          )}

          <button className="crm-button">Send Email</button>
          {(auth[Actions.Contact.VIEW_AND_EDIT_ALL_CONTACT_DETAILS] ||
            isOwner) && (
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

export default ContactDetailNavbar
