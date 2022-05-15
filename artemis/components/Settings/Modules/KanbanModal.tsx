import { Modal } from 'antd'

import { Module } from '@utils/models/module'

type Props = {
  visible: boolean
  close: () => void
  module: Module | undefined
}

export default function KanbanModal({ close, visible }: Props) {
  return (
    <Modal visible={visible} onCancel={close} centered footer={false}></Modal>
  )
}
