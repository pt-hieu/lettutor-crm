import Loading from '@utils/components/Loading'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import {
  DealCategory,
  DealStageData,
  ForecastCategory,
} from '@utils/models/deal'
import { Divider, Modal } from 'antd'
import { useState } from 'react'
import { DealStageTable, TData } from './DealStageTable'

let data: DealStageData[] = [
  {
    id: 'abc1',
    name: 'Qualification',
    probability: 32,
    dealCategory: DealCategory.CLOSED_LOST,
    forecastCategory: ForecastCategory.BEST_CASE,
  },
  {
    id: 'abc2',
    name: 'Needs Analysis',
    probability: 62,
    dealCategory: DealCategory.CLOSED_WON,
    forecastCategory: ForecastCategory.PIPELINE,
  },
  {
    id: 'abc3',
    name: 'Identify Decision Makers',
    probability: 62,
    dealCategory: DealCategory.OPEN,
    forecastCategory: ForecastCategory.OMMITED,
  },
]

type Props = {
  visible: boolean
  handleClose: () => void
  isLoading?: boolean
}

export const DealStageModal = ({ visible, handleClose, isLoading }: Props) => {
  const [dataSource, setDataSource] = useState(data)

  const submitModal = () => {
    const validDatas = dataSource.filter((item) => isValidData(item))
    data = validDatas
    setDataSource(data)
    console.log(validDatas)
    handleClose()
  }

  const closeModal = () => {
    setDataSource(data)
    handleClose()
  }

  return (
    <Modal
      visible={visible}
      onCancel={closeModal}
      width={1000}
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
  return !!data.name
}
