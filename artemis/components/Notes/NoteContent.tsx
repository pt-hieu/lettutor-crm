import Confirm from '@utils/components/Confirm'
import { useModal } from '@utils/hooks/useModal'
import moment from 'moment'
import { useState } from 'react'
import { INoteData, NoteTextBox } from './NoteAdder'

const iconBtn = 'p-2 bg-white rounded-full text-gray-700 border cursor-pointer'

interface IProps {
  title?: string
  note: string
  author: string
  time: string
  setShowNoteAdder: (value: boolean) => void
  hideEditButton?: boolean
  onEditNote: (data: INoteData) => void
}

export const NoteContent = ({
  title,
  note,
  author,
  time,
  setShowNoteAdder,
  hideEditButton = false,
  onEditNote,
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

  const handleDeleteNote = () => {}

  return (
    <>
      {editMode ? (
        <NoteTextBox
          onCancel={handleCancel}
          defaultTitle={title}
          defaultNote={note}
          onSave={onEditNote}
        />
      ) : (
        <div className="flex flex-row relative group pr-[100px]">
          <div className="w-8 h-8 rounded-full bg-blue-300 text-center text-white leading-8">
            avt
          </div>
          <div className="flex-1 pl-4">
            {title && <span className="font-semibold">{title}</span>}
            <div className="w-full whitespace-pre-wrap mb-3">{note}</div>
            <div className="flex flex-row text-[12px] items-center text-gray-500">
              <span>Contact</span>
              <span className="px-1"> - </span>
              <span className="max-w-[120px] truncate text-blue-600">
                Kris Marrierres qwqwqwqwq
              </span>
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
                className={`fa fa-pencil hover:border-blue-500 ${iconBtn}`}
                onClick={handleEditMode}
              />
            )}
            <i
              className={`fa fa-trash hover:border-red-500 hover:text-red-500 ${iconBtn}`}
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
