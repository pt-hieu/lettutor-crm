import { Divider, Modal, notification } from 'antd'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import Loading from '@utils/components/Loading'
import { DealStageAction, DealStageType } from '@utils/models/deal'
import { getDealStages, updateDealStage } from '@utils/service/deal'

import { DealStageTable, TData } from './DealStageTable'

type Props = {
  visible: boolean
  handleClose: () => void
  isLoading?: boolean
}

export const DealStageModal = ({ visible, handleClose }: Props) => {
  const client = useQueryClient()
  const { data, isLoading } = useQuery(['deal-stages'], getDealStages(), {
    enabled: visible,
  })
  const [dataSource, setDataSource] = useState<TData[]>([])

  useEffect(() => {
    setDataSource(data || [])
  }, [data, visible])

  const { mutateAsync, isLoading: submitLoading } = useMutation(
    'update-deal-stage',
    updateDealStage,
    {
      onSuccess: () => {
        notification.success({ message: 'Update deal stage successfully' })
        client.refetchQueries(['deal-stages'])
        handleClose()
      },
      onError: () => {
        notification.error({ message: 'Update deal stage unsuccessfully' })
      },
    },
  )

  const submitModal = () => {
    const validatedData = dataSource.filter(isValidData).map(formatData)
    const dealStageCategories = Object.values(DealStageType)
    const isEnoughCategory = dealStageCategories.every(
      (elem) =>
        validatedData
          .filter((item) => item.action !== DealStageAction.DELETE)
          .findIndex((d) => d.type === elem) > -1,
    )

    if (!isEnoughCategory) {
      notification.error({ message: 'Deal stages must contain all categories' })
      return
    }
    mutateAsync(validatedData)
  }

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      width={900}
      maskClosable={false}
      destroyOnClose
      footer={
        <div className="flex w-full gap-2 justify-end">
          <button
            onClick={submitModal}
            disabled={isLoading}
            className="crm-button"
          >
            <Loading on={submitLoading}>Submit</Loading>
          </button>

          <button onClick={handleClose} className="crm-button-outline">
            Cancel
          </button>
        </div>
      }
    >
      <div className="flex gap-2 items-center">
        <div className="font-medium text-[17px]">Stage-Probability Mapping</div>
      </div>

      <Divider />

      <div className="max-h-[400px] overflow-y-auto overflow-x-hidden crm-scrollbar pr-1">
        <DealStageTable
          dataSource={dataSource}
          setDataSource={setDataSource}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  )
}

function isValidData(data: TData) {
  return !!data.name && !(data.isDeleted && data.isNew)
}

function formatData(data: TData) {
  const newData = { ...data }

  if (newData.isUpdated) {
    newData.action = DealStageAction.UPDATE
    delete newData.isUpdated
  }

  if (newData.isNew) {
    newData.action = DealStageAction.ADD
    delete newData.isNew
    delete newData.id
  }

  if (newData.isDeleted) {
    newData.action = DealStageAction.DELETE
    delete newData.isDeleted
  }

  return newData
}
