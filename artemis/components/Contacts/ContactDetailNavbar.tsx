import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { useMutation } from 'react-query'

import Confirm from '@utils/components/Confirm'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useCommand } from '@utils/hooks/useCommand'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Contact } from '@utils/models/contact'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/contact'

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
    'delete-contact',
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

  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  useCommand('cmd:delete-contact', () => {
    deleteButtonRef.current?.click()
  })

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{data?.fullName}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(auth[Actions.Contact.DELETE_CONTACT] || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([data?.id || ''])}
              message="Are you sure you want to delete this contact?"
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

          <button className="crm-button">Send Email</button>
          {(auth[Actions.Contact.VIEW_AND_EDIT_ALL_CONTACT_DETAILS] ||
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

export default ContactDetailNavbar
