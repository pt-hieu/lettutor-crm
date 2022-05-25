import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import Loading from '@utils/components/Loading'

export interface IFeedTextboxData {
  content: string
  files?: File[]
}

interface ITextboxProps {
  onCancel: () => void
  onSubmit: (data: IFeedTextboxData) => void
  isLoading: boolean
  maxContent?: number
  placeholder: string
  submitText?: string
  prefix?: ReactNode
}

const animateVariant = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export const FeedTextbox = ({
  onCancel,
  onSubmit,
  isLoading,
  maxContent = 500,
  placeholder,
  submitText,
  prefix,
}: ITextboxProps) => {
  const [files, setFiles] = useState<File[]>([])

  const textboxShema = useMemo(
    () =>
      yup.object().shape({
        content: yup
          .string()
          .trim()
          .required('Content is required')
          .max(maxContent, `Content must be at most ${maxContent} characters`),
      }),
    [maxContent],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFeedTextboxData>({
    resolver: yupResolver(textboxShema),
  })

  const contentRef = useRef<any>(null)
  const { ref, ...rest } = register('content')

  const submit = useCallback(
    handleSubmit((data) => {
      data.files = files
      onSubmit(data)
    }),
    [onSubmit, files],
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

    setFiles([...files, ...selectedFiles])
  }

  const removeFile = useCallback((index: number) => {
    setFiles((files) => files.filter((_, i) => i !== index))
  }, [])

  useEffect(() => {
    contentRef && contentRef.current.focus()
  }, [])

  return (
    <div className="w-full border-blue-500 border rounded-md">
      <div className="p-2 flex">
        {prefix}
        <div className="flex-1">
          <textarea
            placeholder={placeholder}
            className="border-transparent focus:border-transparent focus:ring-0 w-full min-h-[40px] pl-2 pt-1 text-[14px]"
            {...rest}
            name="content"
            ref={(e) => {
              ref(e)
              contentRef.current = e
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
      </div>

      <div className="border-b"></div>
      <div className="flex flex-row gap-2 p-2 pl-4 justify-between items-start">
        <div className="mt-2">
          <label
            className="cursor-pointer text-gray-700 hover:text-gray-600"
            htmlFor="file"
          >
            <i className="fa fa-thumb-tack mr-2"></i>
            <span>Attach File</span>
          </label>

          <input
            type="file"
            name="file"
            id="file"
            hidden
            onChange={handleSelectFiles}
            multiple
          />
        </div>

        <div className="flex flex-col flex-1 gap-1 items-center self-center">
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

          <button className="crm-button" onClick={submit}>
            {isLoading ? <Loading /> : submitText || 'Submit'}
          </button>
        </div>
      </div>
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
