import { Divider, Modal, notification } from 'antd'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useMutation, useQueryClient } from 'react-query'

import File from '@components/Notes/File'

import { useCommand } from '@utils/hooks/useCommand'
import { useDispatch } from '@utils/hooks/useDispatch'
import { useModal } from '@utils/hooks/useModal'
import { useStore } from '@utils/hooks/useStore'
import { Attachments } from '@utils/models/note'
import {
  Entity,
  addAttachmentAsFile,
  deleteAttachment,
} from '@utils/service/attachment'

import Loading from './Loading'

type TProps = {
  id: string
  data?: Attachments[]
  entityType: Entity
  entityId: string
}

export default function AttachmentSection({
  id,
  data,
  entityId,
  entityType,
}: TProps) {
  const client = useQueryClient()
  const [modal, open, close] = useModal()

  useCommand('cmd:add-attachment', () => {
    open()
  })

  const { mutateAsync } = useMutation('delete-attachment', deleteAttachment, {
    onSuccess() {
      client.invalidateQueries([entityType, entityId])
      notification.success({ message: 'Delete attachment successfully' })
    },
    onError() {
      notification.success({ message: 'Delete attachment un`successfully' })
    },
  })

  return (
    <div className="p-4 border rounded-md">
      <AddAttachmentModal
        entityId={entityId}
        entityType={entityType}
        close={close}
        visible={modal}
      />

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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,140px))] gap-2">
        {data?.map((file) => (
          <File
            filename={file.key}
            key={file.id}
            onRemove={() => mutateAsync([file.id])}
            location={file.location}
          />
        ))}
      </div>
    </div>
  )
}

type TModalProps = {
  visible: boolean
  close: () => void
  entityType: Entity
  entityId: string
}

enum AddMode {
  FILE = 'As File',
  LINK = 'As Link',
}

function AddAttachmentAsFile() {
  const client = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])

  useCommand('cmd:clear-temp-attachment', () => {
    setFiles([])
  })

  const openInput = useCallback(() => {
    if (!inputRef.current) return
    inputRef.current.click()
  }, [])

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''

    const selectedFilesLength = selectedFiles.length
    if (selectedFilesLength > 5) {
      notification.error({
        message: `You can upload maximum ${5} files only`,
      })

      return
    }

    setFiles(selectedFiles)
  }

  const removeFile = useCallback(
    (name: string) => () => {
      setFiles((files) => files.filter((file) => file.name !== name))
    },
    [],
  )

  useEffect(() => {
    client.setQueryData('store:selected-files', files)
  }, [files])

  return (
    <div>
      <input
        ref={inputRef}
        multiple
        onChange={handleSelectFiles}
        type="file"
        hidden
      />
      <div
        onClick={files.length ? undefined : openInput}
        className={` ${
          files.length
            ? 'grid grid-cols-[repeat(auto-fit,minmax(140px,140px))] place-content-center'
            : 'min-h-[200px] border-dashed cursor-pointer grid place-content-center border rounded-md'
        } `}
      >
        {!files.length && (
          <div className="font-semibold text-gray-400/30 text-xl">
            Browse files
          </div>
        )}

        {files.map((file) => (
          <File
            key={file.name}
            filename={file.name}
            onRemove={removeFile(file.name)}
          />
        ))}
      </div>
    </div>
  )
}

function AddAttachmentAsLink() {
  return <div></div>
}

function AddAttachmentModal({
  close,
  visible,
  entityId,
  entityType,
}: TModalProps) {
  const [selectedMode, selectMode] = useState<AddMode>(AddMode.FILE)

  const dispatch = useDispatch()
  const client = useQueryClient()

  const modeMapping = useMemo<Record<AddMode, React.ReactNode>>(
    () => ({
      [AddMode.FILE]: <AddAttachmentAsFile />,
      [AddMode.LINK]: <AddAttachmentAsLink />,
    }),
    [],
  )

  useEffect(() => {
    if (visible) return
    dispatch('cmd:clear-temp-attachment')
  }, [visible])

  const { data: files } = useStore<File[]>('store:selected-files')

  const { isLoading, mutateAsync } = useMutation(
    'add-attachments',
    addAttachmentAsFile(entityId, entityType),
    {
      onSuccess(_, files) {
        client.invalidateQueries([entityType, entityId])
        client.removeQueries('store:selected-files')
        dispatch('cmd:clear-temp-attachment')

        notification.success({
          message: `Upload ${files.length} atachments successfully`,
        })
      },
      onError() {
        notification.error({
          message: 'Upload unsuccessfully',
        })
      },
    },
  )

  return (
    <Modal
      centered
      closable={!isLoading}
      maskClosable={!isLoading}
      onCancel={close}
      visible={visible}
      footer={null}
    >
      <div className="font-medium text-xl">Add Attachment</div>
      <Divider />

      <div className="flex flex-col items-center">
        <div className="flex items-center mb-4">
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

        <div className="w-full">{modeMapping[selectedMode]}</div>

        <div className="mt-4 flex gap-2 self-end">
          <button onClick={close} className="crm-button-outline">
            Cancel
          </button>

          <button
            onClick={() => mutateAsync(files || [])}
            disabled={isLoading || !files || !files?.length}
            className="crm-button"
          >
            <Loading on={isLoading}>
              <span className="fa fa-upload mr-2" />
              Upload
            </Loading>
          </button>
        </div>
      </div>
    </Modal>
  )
}
