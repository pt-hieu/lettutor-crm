import { notification } from 'antd'
import moment from 'moment'
import Link from 'next/link'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'

import Confirm from '@utils/components/Confirm'
import { useModal } from '@utils/hooks/useModal'
import { Entity } from '@utils/models/module'
import { Attachments } from '@utils/models/note'
import { deleteNote, editNote } from '@utils/service/note'

import File from './File'
import { INoteData, NoteTextBox } from './NoteAdder'

interface IProps {
  title?: string
  note: string
  author: string
  time: Date
  setShowNoteAdder: (value: boolean) => void
  hideEditButton?: boolean
  noteId: string
  noteSource: string
  entity: Pick<Entity, 'id' | 'name'>
  files?: Attachments[]
}

export const NoteContent = ({
  title,
  note,
  author,
  time,
  setShowNoteAdder,
  hideEditButton = false,
  noteId,
  noteSource,
  entity,
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

  const client = useQueryClient()

  const { mutateAsync: editNoteService, isLoading } = useMutation(
    'edit-note',
    editNote,
    {
      onSuccess() {
        client.refetchQueries([entity.id, 'notes'])
        handleCancel()
        notification.success({ message: 'Edit note successfully' })
      },
      onError() {
        notification.error({ message: 'Edit note unsuccessfully' })
      },
    },
  )

  const handleEditNote = (data: INoteData) => {
    const newData = { ...data }

    newData.attachments = data.attachments.map((i) => i.id)
    editNoteService({ noteId, dataInfo: newData })
  }

  const { mutateAsync: deleteNoteService } = useMutation(
    'delete-note',
    deleteNote,
    {
      onSuccess() {
        client.refetchQueries([entity.id, 'notes'])
        notification.success({ message: 'Delete note successfully' })
      },
      onError() {
        notification.error({ message: 'Delete note unsuccessfully' })
      },
    },
  )

  const handleDeleteNote = () => {
    deleteNoteService({ noteId })
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
          isLoading={isLoading}
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
                <File key={id} filename={key} location={location} />
              ))}
            </div>

            <div className="flex flex-row text-[12px] items-center text-gray-500">
              <span className="capitalize">{noteSource}</span>
              <span className="px-1"> - </span>

              <Link href={`/${noteSource}/${entity.id}`}>
                <a className="max-w-[120px] truncate text-blue-600">
                  {entity.name}
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
