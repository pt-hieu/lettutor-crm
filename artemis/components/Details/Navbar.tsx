import { notification } from 'antd'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'
import { useMutation, useQuery } from 'react-query'

import Confirm from '@utils/components/Confirm'
import ConvertModal from '@utils/components/ConvertModal'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useCommand } from '@utils/hooks/useCommand'
import { useModal } from '@utils/hooks/useModal'
import { Entity, Module } from '@utils/models/module'
import { ActionType } from '@utils/models/role'
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

  const { data: convertableModules } = useQuery<Module[]>(
    ['convertable_modules', data?.module.name],
    { enabled: false },
  )
  const canBeConvertedToOthersModules =
    convertableModules && !!convertableModules.length

  const [converModal, open, close] = useModal()

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full" />
          <span className="font-semibold">{name}</span>

          <TraceInfo entity={data} />
        </div>

        <ConvertModal
          sourceId={id || ''}
          visible={converModal}
          close={close}
          moduleName={data?.module.name || ''}
        />

        <div className="grid grid-cols-3 gap-3" style={{ direction: 'rtl' }}>
          {(auth(ActionType.CAN_DELETE_ANY, module?.name) || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([id || ''])}
              message={`Are you sure you want to delete this ${module?.name}?`}
            >
              <button
                ref={deleteButtonRef}
                disabled={isLoading}
                className="crm-button-danger"
                style={{ direction: 'ltr' }}
              >
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            </Confirm>
          )}

          {(auth(ActionType.CAN_CONVERT_ANY, module?.name) || isOwner) &&
            canBeConvertedToOthersModules && (
              <button
                className="crm-button-secondary"
                style={{ direction: 'ltr' }}
                onClick={open}
              >
                <span className="fa fa-exchange mr-2" /> Convert
              </button>
            )}

          {(auth(ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY, module?.name) ||
            isOwner) && (
            <button
              className="crm-button-secondary"
              onClick={navigateToEditPage}
              style={{ direction: 'ltr' }}
            >
              <span className="fa fa-edit mr-2" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
