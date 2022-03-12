import { Divider, Modal, notification } from 'antd'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

import Loading from '@utils/components/Loading'
import {
  DealCategory,
  DealStageAction,
  DealStageData,
} from '@utils/models/deal'
import { getDealStages, updateDealStage } from '@utils/service/deal'

import { DealStageTable, TData } from './DealStageTable'

// let data: DealStageData[] = [
//   {
//     id: 'abc1',
//     name: 'Qualification',
//     probability: 32,
//     dealCategory: DealCategory.CLOSED_LOST,
//   },
//   {
//     id: 'abc2',
//     name: 'Needs Analysis',
//     probability: 62,
//     dealCategory: DealCategory.CLOSED_WON,
//   },
//   {
//     id: 'abc3',
//     name: 'Identify Decision Makers',
//     probability: 62,
//     dealCategory: DealCategory.OPEN,
//   },
// ]

type Props = {
  visible: boolean
  handleClose: () => void
  isLoading?: boolean
}

export const DealStageModal = ({ visible, handleClose, isLoading }: Props) => {
  const { data } = useQuery('deal-stages', () => getDealStages())
  const [dataSource, setDataSource] = useState<TData[]>([])

  useEffect(() => {
    setDataSource(data || [])
  }, [visible])

  const { mutateAsync } = useMutation('update-deal-stage', updateDealStage, {
    onSuccess: () => {
      notification.success({ message: 'Update deal stage successfully' })
    },
    onError: () => {
      notification.error({ message: 'Update deal stage unsuccessfully' })
    },
  })

  const submitModal = () => {
    const validDatas = dataSource.filter(isValidData).map(formatData)
    mutateAsync(validDatas)
    handleClose()
  }

  const closeModal = () => {
    handleClose()
  }

  return (
    <Modal
      visible={visible}
      onCancel={closeModal}
      width={900}
      maskClosable={false}
      footer={
        <div className="flex w-full gap-2 justify-end">
          <button
            onClick={submitModal}
            disabled={isLoading}
            className="crm-button"
          >
            <Loading on={isLoading}>Submit</Loading>
          </button>

          <button onClick={closeModal} className="crm-button-outline">
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
        <DealStageTable dataSource={dataSource} setDataSource={setDataSource} />
      </div>
    </Modal>
  )
}

function isValidData(data: TData) {
  return !!data.name && !(data.isDeleted && data.isNew)
}

function formatData(data: TData) {
  if (data.isUpdated) {
    data.action = DealStageAction.UPDATE
    delete data.isUpdated
  }

  if (data.isNew) {
    data.action = DealStageAction.ADD
    delete data.isNew
  }

  if (data.isDeleted) {
    data.action = DealStageAction.DELETE
    delete data.isDeleted
  }

  return data
}
