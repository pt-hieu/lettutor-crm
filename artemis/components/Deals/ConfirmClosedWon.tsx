import { Modal } from 'antd'
import Input from '@utils/components/Input'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Deal, DealStage } from '@utils/models/deal'

type Props = {
  deal: Deal
  visible: boolean
  onCloseModal: () => void
  onUpdateDeal: (newDeal: Deal) => void
}

type ConfirmClosedWonData = {
  amount: number | null
  closingDate: Date
}

const ConfirmClosedWonSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Amount must be a number.')
    .nullable(true)
    .transform((v, o) => (o === '' ? null : v)),
  closingDate: yup.date().required('Closing Date is required.'),
})

const ConfirmClosedWon = ({
  deal,
  visible,
  onCloseModal,
  onUpdateDeal: updateDeal,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmClosedWonData>({
    mode: 'onChange',
    resolver: yupResolver(ConfirmClosedWonSchema),
  })

  const closeModal = () => {
    onCloseModal()
    reset()
  }

  const closeDealAsClosedWon = handleSubmit(
    ({ amount, closingDate }: ConfirmClosedWonData) => {
      const stage = DealStage.CLOSED_WON
      console.log('closingDate: ', closingDate)
      updateDeal({ ...deal, amount, stage, closingDate })
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
              ...register('closingDate' as keyof ConfirmClosedWonData),
            }}
          />
        </div>
      </form>
    </Modal>
  )
}

export default ConfirmClosedWon
