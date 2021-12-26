import { Modal } from 'antd'

type Props = {
  visible: boolean
  onConfirmCloseTask: () => void
  onCloseModal: () => void
}

const ConfirmCloseModal = ({
  visible,
  onConfirmCloseTask: confirmCloseTask,
  onCloseModal: closeModal,
}: Props) => {
  return (
    <Modal
      visible={visible}
      title="Confirm close task"
      footer={
        <div>
          <button
            onClick={() => {
              confirmCloseTask()
              closeModal()
            }}
            className="crm-button mr-3"
          >
            Mark as Completed
          </button>
          <button onClick={closeModal} className="crm-button-secondary">
            Close
          </button>
        </div>
      }
    >
      <p>Do you sure you want to mark this task as completed?</p>
    </Modal>
  )
}

export default ConfirmCloseModal
