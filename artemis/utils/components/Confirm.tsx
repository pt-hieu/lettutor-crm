import { Divider, Modal } from 'antd'
import React, {
  Children,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  cloneElement,
  useCallback,
  useEffect,
  useState,
} from 'react'

type Props = {
  onYes: any
  message: string
  title?: string
  shouldStopPropagation?: boolean
  asInform?: boolean
  okText?: string
  danger?: boolean
} & (
  | { visible: boolean; close: () => void; children?: never }
  | { visible?: undefined; close?: never; children: ReactNode }
)

const Confirm = ({
  children,
  onYes,
  message,
  title,
  shouldStopPropagation,
  visible,
  close,
  asInform,
  okText,
  danger,
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
            {!asInform && (
              <button
                className={`${
                  danger ? 'crm-button-danger' : 'crm-button'
                } min-w-24`}
                onClick={(e) => {
                  onYes()
                  closeModal(e)
                }}
              >
                {okText ? okText : 'OK'}
              </button>
            )}
            <button className="crm-button-outline w-24" onClick={closeModal}>
              {asInform ? 'Close' : 'Cancel'}
            </button>
          </div>
        }
      >
        <div onClick={stopPropagation}>
          <h4 className="font-medium text-xl">{title || 'Warning'}</h4>
          <div className="mt-2">{message}</div>
        </div>
      </Modal>
    </>
  )
}

Confirm.defaultProps = {
  shouldStopPropagation: true,
}

export default Confirm
