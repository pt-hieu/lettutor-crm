import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal, notification } from 'antd'
import { throttle } from 'lodash'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import * as yup from 'yup'

import File from '@components/Notes/File'

import { useCommand } from '@utils/hooks/useCommand'
import { useDispatch } from '@utils/hooks/useDispatch'
import { useModal } from '@utils/hooks/useModal'
import { useStore } from '@utils/hooks/useStore'
import { Attachments } from '@utils/models/note'
import {
  Entity,
  addAttachmentAsFile,
  addAttachmentAsLink,
  deleteAttachment,
} from '@utils/service/attachment'

import AttachmentTable from './AttachmentTable'
import Input from './Input'
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
      client.refetchQueries([entityType, entityId])
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

      {data && !!data.length && <AttachmentTable data={data} />}
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

export type TFormData = {
  key: string
  location: string
}
const schema = yup.object().shape({
  key: yup.string().typeError('Name has to be a string'),
  location: yup
    .string()
    .typeError('Link has to be a string')
    .url('Link has to be a valid url'),
})
function AddAttachmentAsLink() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm<TFormData>({
    resolver: yupResolver(schema),
  })

  useCommand('cmd:clear-temp-attachment', () => {
    client.setQueryData('store:link-attachment-data', undefined)
    clearErrors()
    reset()
  })

  const client = useQueryClient()
  useEffect(() => {
    const subs = watch(
      throttle(() => {
        handleSubmit(
          (data) => {
            if (!data.key || !data.location) return
            client.setQueryData('store:link-attachment-data', data)
          },
          () => {
            client.setQueryData('store:link-attachment-data', undefined)
          },
        )()
      }, 700),
    )

    return subs.unsubscribe
  }, [watch])

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="mb-4">
        <label htmlFor="name" className="crm-label">
          Name
        </label>
        <Input
          error={errors.key?.message}
          props={{
            type: 'text',
            id: 'name',
            className: 'w-full',
            ...register('key'),
          }}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="link" className="crm-label">
          Link
        </label>
        <Input
          error={errors.location?.message}
          props={{
            type: 'text',
            id: 'link',
            className: 'w-full',
            ...register('location'),
          }}
        />
      </div>
    </form>
  )
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

  useEffect(() => {
    dispatch('cmd:clear-temp-attachment')
  }, [selectedMode])

  const { data: files } = useStore<File[]>('store:selected-files')
  const { data: linkData } = useStore<TFormData>('store:link-attachment-data')

  const { isLoading: isUploadFile, mutateAsync: mutateAttachmentAsFile } =
    useMutation(
      'add-attachments-as-file',
      addAttachmentAsFile(entityId, entityType),
      {
        onSuccess(_, files) {
          client.refetchQueries([entityType, entityId])
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

  const { isLoading: isUploadLink, mutateAsync: mutateAttachmentAsLink } =
    useMutation(
      'add-attachment-as-link',
      addAttachmentAsLink(entityId, entityType),
      {
        onSuccess() {
          client.refetchQueries([entityType, entityId])
          dispatch('cmd:clear-temp-attachment')

          notification.success({
            message: `Upload atachment successfully`,
          })
        },
      },
    )

  return (
    <Modal
      centered
      closable={!isUploadFile || !isUploadLink}
      maskClosable={!isUploadFile || !isUploadLink}
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
            onClick={() =>
              selectedMode === AddMode.FILE
                ? mutateAttachmentAsFile(files || [])
                : mutateAttachmentAsLink(linkData!)
            }
            disabled={
              isUploadFile ||
              isUploadLink ||
              ((!files || !files?.length) && !linkData)
            }
            className="crm-button"
          >
            <Loading on={isUploadFile || isUploadLink}>
              <span className="fa fa-upload mr-2" />
              Upload
            </Loading>
          </button>
        </div>
      </div>
    </Modal>
  )
}
