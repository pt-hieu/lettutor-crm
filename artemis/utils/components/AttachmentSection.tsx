import { Divider, Modal } from 'antd'
import React, { useMemo, useState } from 'react'

import { useCommand } from '@utils/hooks/useCommand'
import { useModal } from '@utils/hooks/useModal'
import { Attachments } from '@utils/models/note'

type TProps = {
  id: string
  data?: Attachments[]
}

export default function AttachmentSection({ id, data }: TProps) {
  const [modal, open, close] = useModal()

  useCommand('cmd:add-attachment', () => {
    open()
  })

  return (
    <div className="p-4 border rounded-md">
      <AddAttachmentModal close={close} visible={modal} />

      <div className="mb-4 flex gap-4 items-center">
        <div className="font-semibold text-[17px] capitalize" id={id}>
          {id}
        </div>

        <button onClick={open} className="crm-button">
          <span className="fa fa-plus mr-2" />
          Add
        </button>
      </div>

      {(!data || !data?.length) && (
        <div className="text-gray-500 font-medium">No attachments found.</div>
      )}
    </div>
  )
}

type TModalProps = {
  visible: boolean
  close: () => void
}

enum AddMode {
  FILE = 'As File',
  LINK = 'As Link',
}

function AddAttachmentAsFile() {
  return <div></div>
}

function AddAttachmentAsLink() {
  return <div></div>
}

function AddAttachmentModal({ close, visible }: TModalProps) {
  const [selectedMode, selectMode] = useState<AddMode>(AddMode.FILE)

  const modeMapping = useMemo<Record<AddMode, React.ReactNode>>(
    () => ({
      [AddMode.FILE]: <AddAttachmentAsFile />,
      [AddMode.LINK]: <AddAttachmentAsLink />,
    }),
    [],
  )

  return (
    <Modal centered onCancel={close} visible={visible} footer={null}>
      <div className="font-medium text-xl">Add Attachment</div>
      <Divider />

      <div className="flex flex-col items-center">
        <div className="flex items-center">
          {Object.values(AddMode).map((mode) => (
            <button
              onClick={() => selectMode(mode)}
              className={`${
                mode === selectedMode ? 'crm-button' : 'crm-button-secondary'
              } first-of-type:rounded-r-none last-of-type:rounded-l-none`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div>{modeMapping[selectedMode]}</div>
      </div>
    </Modal>
  )
}
