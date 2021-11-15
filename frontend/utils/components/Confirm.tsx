import { Modal } from 'antd'
import React, {
  useState,
  Children,
  cloneElement,
  SyntheticEvent,
  ReactElement,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'

type Props = {
  onYes: any
  message: string
  title?: string
  shouldStopPropagation?: boolean
} & (
  | { visible: boolean; close: () => void; children?: void }
  | { visible?: undefined; close: void; children: ReactNode }
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

  const closeModal = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      setModalVisibility(false)
      close && close()
    },
    [close],
  )

  const openModal = useCallback(
    (e: SyntheticEvent) => {
      if (shouldStopPropagation) e.stopPropagation()
      setModalVisibility(true)
    },
    [shouldStopPropagation],
  )

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

  const stopPropagation = useCallback(
    (e: SyntheticEvent) => e.stopPropagation(),
    [],
  )

  return (
    <>
      {children && renderModifiedChildren()}
      <Modal
        visible={modalVisibility}
        onCancel={closeModal}
        centered
        footer={
          <div className="space-x-2">
            <button
              className="crm-button w-24"
              onClick={(e) => {
                onYes()
                closeModal(e)
              }}
            >
              OK
            </button>
            <button className="crm-button-outline w-24" onClick={closeModal}>
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
