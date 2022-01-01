import { Modal, notification } from 'antd'
import Input from '@utils/components/Input'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Deal, DealStage } from '@utils/models/deal'
import { useMutation, useQuery } from 'react-query'
import { addNote } from '@utils/service/note'
import { AddNoteDto } from '@utils/models/note'
import { getSelf } from '@utils/service/user'

type Props = {
  deal: Deal
  stage: DealStage.CLOSED_LOST | DealStage.CLOSED_LOST_TO_COMPETITION
  visible: boolean
  onCloseModal: () => void
  onUpdateDeal: (newDeal: Deal) => void
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

  const { data } = useQuery('self-info', getSelf())

  const { mutateAsync } = useMutation('add-note', addNote, {
    onSuccess: () => {
      notification.success({
        message: 'Add reason for loss successfully.',
      })
    },
    onError: () => {
      notification.error({ message: 'Add reason for loss unsuccessfully.' })
    },
  })

  const addReasonForLossNote = (reason: string) => {
    const note: AddNoteDto = {
      ownerId: data?.id as string,
      dealId: deal.id,
      title: stage,
      content: reason,
    }

    mutateAsync(note)
  }

  const closeDealAsClosedWon = handleSubmit(
    ({ reason }: ConfirmClosedLossData) => {
      updateDeal({ ...deal, stage })
      if (reason) {
        addReasonForLossNote(reason)
      }
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
