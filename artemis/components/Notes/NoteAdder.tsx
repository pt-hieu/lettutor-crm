import { yupResolver } from '@hookform/resolvers/yup'
import { Tooltip } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import Input from '../../utils/components/Input'
import { notification } from 'antd'

export const noteShema = yup.object().shape({
  content: yup
    .string()
    .trim()
    .required('Note is required')
    .max(500, 'Note must be at most 500 characters'),
})

export interface INoteData {
  title?: string
  content: string
  files?: File[]
}

interface ITextboxProps {
  onCancel: () => void
  onSave: (data: INoteData) => void
  defaultTitle?: string
  defaultNote?: string
  defaultFile?: File[]
}

const animateVariant = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export const NoteTextBox = ({
  onCancel,
  onSave,
  defaultTitle,
  defaultNote,
  defaultFile,
}: ITextboxProps) => {
  const [hasTitle, setHasTitle] = useState(!!defaultTitle)
  const [title, setTitle] = useState(defaultTitle || '')

  // File
  const [files, setFiles] = useState<File[] | undefined>(defaultFile)

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

  const handleAddTitle = () => {
    setHasTitle(true)
  }

  const handleTitleInputBlur = () => {
    if (title.trim()) return
    setHasTitle(false)
    setTitle('')
  }

  const handleSave = handleSubmit((data) => {
    if (title.length > 100) {
      setError('content', { message: 'Title must be at most 100 characters' })
      return
    }
    if (hasTitle) {
      data.title = title
    }
    if (files?.length) {
      data.files = files
    }
    onSave(data)
  })

  //File
  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const MAX_NUM_FILE = 5
    const MAX_MB_SIZE = 20
    const MAX_SIZE_FILE = MAX_MB_SIZE * 1024 * 1024 // 20 MB

    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = '' //can choose same most previous file

    //Check exist empty file
    for (let file of selectedFiles) {
      if (!file.size) {
        notification.error({
          message: `The file ${file.name} is not supported`,
        })
        return
      }
    }

    const currentFilesLength = files?.length || 0
    const selectedFilesLength = selectedFiles?.length || 0

    if (selectedFilesLength + currentFilesLength > MAX_NUM_FILE) {
      notification.error({
        message: `You can upload maximum ${MAX_NUM_FILE} files only`,
      })
      return
    }

    const currentFilesSize = files?.reduce((a, c) => a + c.size, 0) || 0
    const selectedFilesSize = selectedFiles.reduce((a, c) => a + c.size, 0) || 0

    if (selectedFilesSize + currentFilesSize > MAX_SIZE_FILE) {
      notification.error({
        message: `The total file size exceeds the allowed limit of ${MAX_MB_SIZE} MB`,
      })
      return
    }
    setFiles([...(files || []), ...selectedFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files?.filter((_, i) => i !== index))
  }

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
          <Tooltip title="Upload file" mouseEnterDelay={1}>
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
                onClick={handleAddTitle}
              >
                Add title
              </span>
            </>
          )}
        </div>
        <div className="flex flex-col flex-1 gap-1 items-center self-center">
          {files?.map(({ name, size }, index) => (
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
                onClick={() => handleRemoveFile(index)}
              ></i>
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-2">
          <button className="crm-button-secondary" onClick={onCancel}>
            Cancle
          </button>
          <button className="crm-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

interface INoteAdderProps {
  onAddNote: (data: INoteData) => void
  active?: boolean
}

export const NoteAdder = ({ onAddNote, active = false }: INoteAdderProps) => {
  const [isActive, setIsActive] = useState(active)

  const handleAddNote = (data: INoteData) => {
    onAddNote(data)
    setIsActive(false)
  }

  return (
    <div className="mb-4">
      {isActive ? (
        <NoteTextBox
          onCancel={() => setIsActive(false)}
          onSave={handleAddNote}
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
