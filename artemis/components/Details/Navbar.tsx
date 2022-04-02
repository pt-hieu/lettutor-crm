import { notification } from 'antd'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'
import { useMutation } from 'react-query'

import Confirm from '@utils/components/Confirm'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useCommand } from '@utils/hooks/useCommand'
import { Entity } from '@utils/models/module'
import { Actions } from '@utils/models/role'
import { batchDeleteEntities } from '@utils/service/module'

type Props = {
  data: Entity | undefined
}

export const DetailNavbar = ({ data }: Props) => {
  const { name, id } = data || {}
  const { module } = data || {}

  const router = useRouter()
  const navigateToEditPage = () => {
    router.push(`/${module?.name}/${id}/update`)
  }

  const auth = useAuthorization()
  // const isOwner = useOwnership(data)

  //TODO: need to refactor in the future
  const isOwner = true

  const { mutateAsync, isLoading } = useMutation(
    'delete-entities',
    batchDeleteEntities,
    {
      onSuccess() {
        router.push(`/${module?.name}`)
        notification.success({ message: `Delete ${module?.name} successfully` })
      },
      onError() {
        notification.error({ message: `Delete ${module?.name} unsuccessfully` })
      },
    },
  )

  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  useCommand('cmd:delete-entities', () => {
    deleteButtonRef.current?.click()
  })

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{name}</span>
          <TraceInfo entity={data} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(auth[Actions.Account.DELETE_ACCOUNT] || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([id || ''])}
              message={`Are you sure you want to delete this ${module?.name}?`}
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
