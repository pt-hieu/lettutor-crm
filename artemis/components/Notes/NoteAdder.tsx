import { yupResolver } from '@hookform/resolvers/yup'
import { AnimatePresence, motion } from 'framer-motion'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import Input from '../../utils/components/Input'

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
  file?: File
}

interface ITextboxProps {
  onCancel: () => void
  onSave: (data: INoteData) => void
  defaultTitle?: string
  defaultNote?: string
  defaultFile?: File
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
  const [selectedFile, setSelectedFile] = useState<File | undefined>(
    defaultFile,
  )

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
    if (selectedFile) {
      data.file = selectedFile
    }
    onSave(data)
  })

  //File
  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files ? event.target.files[0] : undefined)
    event.target.value = ''
  }

  const handleRemoveFile = () => {
    setSelectedFile(undefined)
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
            noteRef.current = e // you can still assign to ref
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
      <div className="flex flex-row gap-2 p-2 pl-4 justify-between items-center">
        <div>
          <label
            className="fa fa-thumb-tack cursor-pointer hover:text-gray-600"
            htmlFor="file"
          />
          <input
            type="file"
            name="file"
            id="file"
            hidden
            onChange={handleChangeFile}
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
        {selectedFile && (
          <div className="flex flex-1 flex-row self-center max-w-[300px] p-1 px-2 rounded bg-slate-50 justify-between items-center text-[12px]">
            <div className="flex flex-row">
              <span className="text-blue-600 mr-2 max-w-[180px] truncate">
                {selectedFile.name}
              </span>
              <span>({formatBytes(selectedFile.size)})</span>
            </div>
            <i
              className="fa fa-times-circle text-gray-500 hover:text-red-500 cursor-pointer"
              onClick={handleRemoveFile}
            ></i>
          </div>
        )}

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
