import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import Tooltip from '@utils/components/Tooltip'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { AddNoteDto, Attachments, NoteSource } from '@utils/models/note'
import { addNote } from '@utils/service/note'

export const noteShema = yup.object().shape({
  content: yup
    .string()
    .trim()
    .required('Note is required')
    .max(500, 'Note must be at most 500 characters'),
})

const MAX_NUM_FILE = 5
const MAX_MB_SIZE = 20
const MAX_SIZE_FILE = MAX_MB_SIZE * 1024 * 1024 // 20 MB

export interface INoteData {
  title?: string
  content: string
  files?: File[]
  attachments: any[]
}

interface ITextboxProps {
  onCancel: () => void
  onSave: (data: INoteData) => void
  isLoading: boolean
  defaultTitle?: string
  defaultNote?: string
  defaultFiles?: Attachments[]
}

const animateVariant = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export const NoteTextBox = ({
  onCancel,
  onSave: saveNote,
  isLoading,
  defaultTitle,
  defaultNote,
  defaultFiles: defaultFile,
}: ITextboxProps) => {
  const [hasTitle, setHasTitle] = useState(!!defaultTitle)
  const [title, setTitle] = useState(defaultTitle || '')
  const [attachments, setAttachments] = useState<Attachments[]>(
    defaultFile || [],
  )

  const [files, setFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<INoteData>({
    resolver: yupResolver(noteShema),
    defaultValues: {
      content: defaultNote,
    },
  })

  const titleRef = useRef<any>(null)
  const noteRef = useRef<any>(null)
  const { ref, ...rest } = register('content')

  const turnOnTitle = useCallback(() => {
    setHasTitle(true)
  }, [])

  const handleTitleInputBlur = () => {
    if (title.trim()) return

    setHasTitle(false)
    setTitle('')
  }

  const submitNote = useCallback(
    handleSubmit((data) => {
      if (title.length > 100) {
        setError('content', { message: 'Title must be at most 100 characters' })
        return
      }

      if (hasTitle) {
        data.title = title
      }

      data.attachments = attachments
      data.files = files

      saveNote(data)
    }),
    [saveNote, title, files, attachments],
  )

  //File
  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''

    //Check exist empty file
    for (let file of selectedFiles) {
      if (!file.size) {
        notification.error({
          message: `The file ${file.name} is not supported`,
        })

        return
      }
    }

    const currentFilesLength = attachments.length
    const selectedFilesLength = selectedFiles.length

    if (selectedFilesLength + currentFilesLength > MAX_NUM_FILE) {
      notification.error({
        message: `You can upload maximum ${MAX_NUM_FILE} files only`,
      })

      return
    }

    const currentFilesSize =
      attachments.reduce((totalSize, file) => totalSize + file.size, 0) +
      files.reduce((size, file) => size + file.size, 0)

    const selectedFilesSize = selectedFiles.reduce(
      (totalSize, file) => totalSize + file.size,
      0,
    )

    if (selectedFilesSize + currentFilesSize > MAX_SIZE_FILE) {
      notification.error({
        message: `The total file size exceeds the allowed limit of ${MAX_MB_SIZE} MB`,
      })

      return
    }

    setFiles([...files, ...selectedFiles])
  }

  const removeAttachment = useCallback((index: number) => {
    setAttachments((attachments) => attachments?.filter((_, i) => i !== index))
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((files) => files.filter((_, i) => i !== index))
  }, [])

  useEffect(() => {
    if (!title.trim() && hasTitle) {
      titleRef && titleRef.current.focus()
    }
  }, [hasTitle])

  useEffect(() => {
    noteRef && noteRef.current.focus()
  }, [])

  return (
    <div className="w-full border-blue-500 border rounded-md">
      <div className="p-2">
        <AnimatePresence presenceAffectsLayout>
          {hasTitle && (
            <motion.div
              initial="init"
              animate="animating"
              exit="init"
              variants={animateVariant}
            >
              <input
                placeholder="Add a title..."
                className="px-2 focus:outline-none placeholder-bold font-semibold text-[15px] text-gray-700 w-[600px]"
                onBlur={handleTitleInputBlur}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                ref={titleRef}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          placeholder="Add a note"
          className="border-transparent focus:border-transparent focus:ring-0 w-full min-h-[40px] pl-2 pt-1"
          {...rest}
          name="content"
          ref={(e) => {
            ref(e)
            noteRef.current = e
          }}
        />

        <AnimatePresence presenceAffectsLayout>
          {errors.content && (
            <motion.div
              initial="init"
              animate="animating"
              exit="init"
              variants={animateVariant}
              className="text-red-600 overflow-hidden pl-2"
            >
              {errors.content.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-b"></div>
      <div className="flex flex-row gap-2 p-2 pl-4 justify-between items-start">
        <div className="mt-2">
          <Tooltip title="Upload file">
            <label
              className="fa fa-thumb-tack cursor-pointer hover:text-gray-600"
              htmlFor="file"
            />
          </Tooltip>

          <input
            type="file"
            name="file"
            id="file"
            hidden
            onChange={handleSelectFiles}
            multiple
          />

          {!hasTitle && (
            <>
              <span className="mx-3">|</span>
              <span
                className="cursor-pointer hover:text-gray-600"
                onClick={turnOnTitle}
              >
                Add title
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col flex-1 gap-1 items-center self-center">
          {attachments.map(({ key, size }, index) => (
            <FileAttachment
              index={index}
              name={key}
              size={size}
              key={key}
              onRemoveFile={removeAttachment}
            />
          ))}

          {files.map(({ size, name }, index) => (
            <FileAttachment
              key={name}
              onRemoveFile={removeFile}
              size={size}
              name={name}
              index={index}
            />
          ))}
        </div>

        <div className="flex flex-row gap-2">
          <button className="crm-button-secondary" onClick={onCancel}>
            Cancel
          </button>

          <button className="crm-button" onClick={submitNote}>
            {isLoading ? <Loading /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface INoteAdderProps {
  active?: boolean
  entityId: string
  source: NoteSource
}

export const NoteAdder = ({
  active = false,
  entityId,
  source,
}: INoteAdderProps) => {
  const [isActive, setIsActive] = useState(active)

  const client = useQueryClient()
  const [session] = useTypedSession()

  const { mutateAsync: addNoteService, isLoading } = useMutation(
    'add-note',
    addNote,
    {
      onSuccess() {
        client.refetchQueries([entityId, 'notes'])
        setIsActive(false)
      },
      onError() {
        notification.error({ message: 'Add note unsuccessfully' })
      },
    },
  )

  const handleAddNote = (data: INoteData) => {
    const dataInfo: AddNoteDto = {
      ...data,
      ownerId: session?.user.id as string,
      source,
      taskId: source === 'task' ? entityId : undefined,
      entityId: source === 'task' ? undefined : entityId,
    }
    addNoteService(dataInfo)
  }

  return (
    <div className="mb-4">
      {isActive ? (
        <NoteTextBox
          onCancel={() => setIsActive(false)}
          onSave={handleAddNote}
          isLoading={isLoading}
        />
      ) : (
        <Input
          as="input"
          props={{
            placeholder: 'Add a note...',
            type: 'text',
            className: 'w-full',
            onFocus: () => setIsActive(true),
          }}
          showError={false}
        />
      )}
    </div>
  )
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

type AttachmentProps = {
  index: number
  name: string
  size: number
  onRemoveFile: (index: number) => void
}

function FileAttachment({
  index,
  name,
  size,
  onRemoveFile: removeFile,
}: AttachmentProps) {
  return (
    <div
      key={index}
      className="flex w-[300px] p-1 px-2 rounded bg-slate-50 justify-between items-center text-[12px]"
      title={name}
    >
      <div className="flex flex-row">
        <span className="text-blue-600 mr-2 max-w-[180px] truncate">
          {name}
        </span>
        <span>({formatBytes(size)})</span>
      </div>

      <i
        className="fa fa-times-circle text-gray-500 hover:text-red-500 cursor-pointer"
        onClick={() => removeFile(index)}
      />
    </div>
  )
}
