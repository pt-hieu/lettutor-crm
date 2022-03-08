import { yupResolver } from '@hookform/resolvers/yup'
import { Modal } from 'antd'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { Deal, DealStage, UpdateDealDto } from '@utils/models/deal'

type Props = {
  deal: Deal
  stage: DealStage.CLOSED_LOST | DealStage.CLOSED_LOST_TO_COMPETITION
  visible: boolean
  onCloseModal: () => void
  onUpdateDeal: (id: string, updateDealDto: UpdateDealDto) => void
}

type ConfirmClosedLossData = {
  reason: string | null
}

const ConfirmClosedLossSchema = yup.object().shape({
  reason: yup
    .string()
    .max(500, 'Reason for loss must be at most 500 characters.'),
})

const ConfirmReasonForLoss = ({
  deal,
  stage,
  visible,
  onCloseModal,
  onUpdateDeal: updateDeal,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmClosedLossData>({
    mode: 'onChange',
    resolver: yupResolver(ConfirmClosedLossSchema),
  })

  const closeModal = () => {
    onCloseModal()
    reset()
  }

  const [session] = useTypedSession()
  const ownerId = session?.user.id

  const closeDealAsClosedWon = handleSubmit(
    ({ reason }: ConfirmClosedLossData) => {
      updateDeal(deal.id, { ownerId, stage, reasonForLoss: reason })
      reset()
      closeModal()
    },
  )

  return (
    <Modal
      title="Verify Details"
      visible={visible}
      onCancel={closeModal}
      centered
      footer={
        <div className="flex w-full gap-2 justify-end">
          <button onClick={closeDealAsClosedWon} className="crm-button">
            Save
          </button>
          <button onClick={closeModal} className="crm-button-outline">
            Cancel
          </button>
        </div>
      }
    >
      <form className="p-4">
        <div className="mb-4">
          <label htmlFor="reason" className="crm-label after:content-['']">
            Reason For Loss
          </label>
          <Input
            error={errors.reason?.message}
            as="textarea"
            props={{
              id: 'reason',
              className: 'w-full',
              defaultValue: undefined,
              ...register('reason' as keyof ConfirmClosedLossData),
            }}
          />
        </div>
      </form>
    </Modal>
  )
}

export default ConfirmReasonForLoss
