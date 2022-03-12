import moment from 'moment'
import Link from 'next/link'
import { useState } from 'react'

import Confirm from '@utils/components/Confirm'
import Tooltip from '@utils/components/Tooltip'
import { useModal } from '@utils/hooks/useModal'
import { Attachments, NoteSource } from '@utils/models/note'

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
  files?: Attachments[]
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

            <div className="flex gap-2">
              {files?.map(({ id, key, location }) => (
                <div key={id} className="w-[120px] file-container">
                  <div className="bg-white border h-[120px] flex items-center justify-center px-4 relative rounded">
                    <div className="text-blue-500 truncate">{key}</div>
                    <div className="hidden absolute bottom-0 w-full text-center file-controller bg-slate-100">
                      <Tooltip title="Download file">
                        <a
                          className="fa fa-download"
                          href={location}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={key}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div className="w-full text-[12px] truncate text-center mt-1 mb-2">
                    {key}
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
              <button
                className="crm-icon-btn hover:border-blue-500"
                onClick={handleEditMode}
              >
                <i className="fa fa-pencil" />
              </button>
            )}
            <button
              className="crm-icon-btn hover:border-red-500 hover:text-red-500"
              onClick={openConfirm}
            >
              <i className="fa fa-trash" />
            </button>
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
