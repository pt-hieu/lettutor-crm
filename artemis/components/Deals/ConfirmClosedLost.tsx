import { yupResolver } from '@hookform/resolvers/yup'
import { Modal } from 'antd'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import {
  Deal,
  DealStage,
  DealStageType,
  UpdateDealDto,
} from '@utils/models/deal'

type Props = {
  deal: Deal
  stageId: string
  visible: boolean
  onCloseModal: () => void
  onUpdateDeal: (id: string, updateDealDto: UpdateDealDto) => void
}

type ConfirmClosedLossData = {
  amount: number | null
  closingDate: Date
  reason: string | null
}

const ConfirmClosedLossSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Amount must be a number.')
    .nullable(true)
    .transform((v, o) => (o === '' ? null : v)),
  closingDate: yup.date().required('Closing Date is required.'),
  reason: yup
    .string()
    .max(500, 'Reason for loss must be at most 500 characters.'),
})

const ConfirmCloseLost = ({
  deal,
  stageId,
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

  const closeDealAsCloseLoss = handleSubmit(
    ({ amount, closingDate, reason }: ConfirmClosedLossData) => {
      updateDeal(deal.id, {
        ownerId,
        stageId,
        amount,
        closingDate,
        reasonForLoss: reason,
      })
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
          <button onClick={closeDealAsCloseLoss} className="crm-button">
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
          <label htmlFor="amount" className="crm-label after:content-['']">
            Amount
          </label>
          <Input
            error={errors.amount?.message}
            props={{
              type: 'number',
              id: 'amount',
              defaultValue: `${deal?.amount}`,
              className: 'w-full',
              ...register('amount', {
                setValueAs: (v: string) => Number(v),
              }),
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="crm-label">
            Closing Date
          </label>
          <Input
            error={errors.closingDate?.message}
            props={{
              type: 'date',
              id: 'date',
              defaultValue: `${deal?.closingDate}`,
              className: 'w-full',
              ...register('closingDate' as keyof ConfirmClosedLossData),
            }}
          />
        </div>

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

export default ConfirmCloseLost
