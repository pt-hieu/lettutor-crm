import { Modal } from 'antd'
import React, {
  useState,
  Children,
  cloneElement,
  SyntheticEvent,
  ReactElement,
  ReactNode,
  useEffect,
} from 'react'

type Props = {
  children?: ReactNode
  onYes: any
  message: string
  title?: string
  shouldStopPropagation?: boolean
} & (
  | { visible: boolean; close: () => void }
  | { visible?: undefined; close: void }
)

const Confirm = ({
  children,
  onYes,
  message,
  title,
  shouldStopPropagation,
  visible,
  close,
}: Props) => {
  const [modalVisibility, setModalVisibility] = useState(visible)

  const closeModal = (e: SyntheticEvent) => {
    e.stopPropagation()
    setModalVisibility(false)
  }

  const openModal = (e: SyntheticEvent) => {
    if (shouldStopPropagation) e.stopPropagation()
    setModalVisibility(true)
  }

  useEffect(() => {
    setModalVisibility(visible)
  }, [visible])

  const renderModifiedChildren = () => {
    return Children.map(children, (child) => {
      return cloneElement(child as ReactElement, {
        onClick: openModal,
      })
    })
  }

  const stopPropagation = (e: SyntheticEvent) => e.stopPropagation()

  return (
    <>
      {children && renderModifiedChildren()}
      <Modal
        visible={modalVisibility}
        onCancel={(e) => {
          closeModal(e)
          close && close()
        }}
        centered
        footer={
          <div className="space-x-2">
            <button
              className="crm-button w-24"
              onClick={(e) => {
                onYes()
                closeModal(e)
                close && close()
              }}
            >
              OK
            </button>
            <button
              className="crm-button-outline w-24"
              onClick={(e) => {
                closeModal(e)
                close && close()
              }}
            >
              Cancel
            </button>
          </div>
        }
      >
        <div onClick={stopPropagation}>
          <h4 className="font-medium text-2xl">{title || 'Warning'}</h4>

          <div className="my-3">{message}</div>
        </div>
      </Modal>
    </>
  )
}

Confirm.defaultProps = {
  shouldStopPropagation: true,
}

export default Confirm
