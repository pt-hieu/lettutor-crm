import Confirm from '@utils/components/Confirm'
import { useModal } from '@utils/hooks/useModal'
import { FileInfo, NoteSource } from '@utils/models/note'
import { Tooltip } from 'antd'
import moment from 'moment'
import Link from 'next/link'
import { useState } from 'react'
import { INoteData, NoteTextBox } from './NoteAdder'

interface IProps {
  title?: string
  note: string
  author: string
  time: Date
  setShowNoteAdder: (value: boolean) => void
  onEditNote: (noteId: string, data: INoteData) => void
  onDeleteNote: (noteId: string) => void
  hideEditButton?: boolean
  noteId: string
  noteSource: NoteSource
  sourceName: string
  sourceId: string
  files?: FileInfo[]
}

export const NoteContent = ({
  title,
  note,
  author,
  time,
  setShowNoteAdder,
  hideEditButton = false,
  onEditNote,
  onDeleteNote,
  noteId,
  noteSource,
  sourceName,
  sourceId,
  files,
}: IProps) => {
  const [editMode, setEditMode] = useState(false)
  const [confirm, openConfirm, closeConfirm] = useModal()

  const handleEditMode = () => {
    setEditMode(true)
    setShowNoteAdder(false)
  }

  const handleCancel = () => {
    setEditMode(false)
    setShowNoteAdder(true)
  }

  const handleDeleteNote = () => {
    onDeleteNote(noteId)
  }

  const handleEditNote = (data: INoteData) => {
    onEditNote(noteId, data)
    handleCancel()
  }

  return (
    <>
      {editMode ? (
        <NoteTextBox
          onCancel={handleCancel}
          defaultTitle={title}
          defaultNote={note}
          defaultFiles={files}
          onSave={handleEditNote}
        />
      ) : (
        <div className="flex flex-row relative group">
          <div className="w-8 h-8 rounded-full bg-blue-300 text-center text-white leading-8">
            avt
          </div>
          <div className="flex-1 pl-4">
            {title && (
              <div className="font-semibold whitespace-pre-wrap break-all pr-[90px]">
                {title}
              </div>
            )}
            <div className="w-full whitespace-pre-wrap break-all mb-1 pr-[90px]">
              {note}
            </div>
            {/* File */}
            <div className="flex gap-2">
              {files?.map(({ id, name: filename }) => (
                <div key={id} className="w-[120px] file-container">
                  <div className="bg-white border h-[120px] flex items-center justify-center px-4 relative rounded">
                    <div className="text-blue-500 truncate">{filename}</div>
                    <div className="hidden absolute bottom-0 w-full text-center file-controller bg-slate-100">
                      <Tooltip title="Download file" mouseEnterDelay={1}>
                        <a
                          className="fa fa-download"
                          href="/filename.csv"
                          download={filename}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="w-full text-[12px] truncate text-center mt-1 mb-2">
                    {filename}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-row text-[12px] items-center text-gray-500">
              <span className="capitalize">{noteSource}</span>
              <span className="px-1"> - </span>
              <Link href={`/${noteSource}s/${sourceId}`}>
                <a className="max-w-[120px] truncate text-blue-600">
                  {sourceName}
                </a>
              </Link>
              <span className="px-3 font-bold text-[16px]">•</span>
              <span>Add note</span>
              <span className="px-3 font-bold text-[16px]">•</span>
              <span>
                <i className="fa fa-clock mr-1"></i>
                <span>
                  {moment(time).fromNow()} by {author}
                </span>
              </span>
            </div>
          </div>
          <div className="absolute hidden top-2 right-0 group-hover:flex flex-row gap-3">
            {!hideEditButton && (
              <i
                className={`fa fa-pencil hover:border-blue-500 crm-icon-btn`}
                onClick={handleEditMode}
              />
            )}
            <i
              className={`fa fa-trash hover:border-red-500 hover:text-red-500 crm-icon-btn`}
              onClick={openConfirm}
            />
          </div>
        </div>
      )}
      <Confirm
        visible={confirm}
        close={closeConfirm}
        message={getMessageDeleteNote(title || note)}
        onYes={handleDeleteNote}
      />
    </>
  )
}

function getMessageDeleteNote(value: string) {
  const MAX_LENGTH = 30
  const message =
    value.length <= MAX_LENGTH
      ? value
      : value.substring(0, MAX_LENGTH).concat('...')

  return `Are you sure to delete note "${message}"`
}
