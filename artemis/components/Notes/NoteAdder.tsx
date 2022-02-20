import { yupResolver } from '@hookform/resolvers/yup'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
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
}

interface ITextboxProps {
  onCancel: () => void
  onSave: (data: INoteData) => void
  defaultTitle?: string
  defaultNote?: string
}

export const NoteTextBox = ({
  onCancel,
  onSave,
  defaultTitle,
  defaultNote,
}: ITextboxProps) => {
  const [hasTitle, setHasTitle] = useState(!!defaultTitle)
  const [title, setTitle] = useState(defaultTitle || '')
  const [content, setContent] = useState(defaultNote || '')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<INoteData>({
    resolver: yupResolver(noteShema),
    defaultValues: {
      content,
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
    onSave(data)
  })

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
        {hasTitle && (
          <input
            placeholder="Add a title..."
            className="px-2 focus:outline-none placeholder-bold font-semibold text-[15px] text-gray-700 w-[600px]"
            onBlur={handleTitleInputBlur}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            ref={titleRef}
          />
        )}
        <textarea
          placeholder="Add a note"
          className="border-transparent focus:border-transparent focus:ring-0 w-full min-h-[40px] pl-2 pt-1"
          {...rest}
          name="content"
          ref={(e) => {
            ref(e)
            noteRef.current = e // you can still assign to ref
          }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <AnimatePresence presenceAffectsLayout>
          {errors.content && (
            <motion.div
              initial="init"
              animate="animating"
              exit="init"
              variants={{
                init: { opacity: 0, height: 0, marginTop: 0 },
                animating: { opacity: 1, height: 'auto', marginTop: 8 },
              }}
              className="text-red-600 overflow-hidden pl-2"
            >
              {errors.content.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-b"></div>
      <div className="flex flex-row gap-2 p-2 pl-4 justify-between items-center">
        {!hasTitle ? (
          <div
            className="crm-button-secondary bg-transparent cursor-pointer hover:bg-gray-100"
            onClick={handleAddTitle}
          >
            <i className="fa fa-thumb-tack mr-2"></i>Add title
          </div>
        ) : (
          <div></div>
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
