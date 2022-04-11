import { Select, notification } from 'antd'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { Sections } from '@components/Details/Sidebar'
import { LeadDetailSections } from '@components/Leads/LeadDetailSidebar'
import { toCapitalizedWords } from '@components/Module/OverviewView'

import { useTypedSession } from '@utils/hooks/useTypedSession'
import { AddNoteDto, Note, NoteSource } from '@utils/models/note'
import {
  FilterNoteType,
  SortNoteType,
  addNote,
  deleteNote,
  editNote,
  getNotes,
} from '@utils/service/note'

import { INoteData, NoteAdder } from './NoteAdder'
import { NoteContent } from './NoteContent'

const { Option, OptGroup } = Select

interface IProps {
  id: Sections
  source: NoteSource
  entityId: string
  moduleName: string
  hasFilter?: boolean
}

export const DEFAULT_NUM_NOTE = 3

export const NoteSection = ({
  id,
  entityId,
  source,
  moduleName,
  hasFilter = false,
}: IProps) => {
  const [showNoteAdder, setShowNoteAdder] = useState(true)
  const [filter, setFilter] = useState<FilterNoteType>()
  const [sort, setSort] = useState<SortNoteType>('first')
  const [showPrevious, setShowPrevious] = useState(true)
  const [viewAllNote, setViewAllNote] = useState(false)

  const { data, refetch } = useQuery<any>(
    [entityId, 'notes'],
    getNotes({
      source,
      sourceId: entityId,
      sort,
      filter,
      shouldNotPaginate: viewAllNote,
      nTopRecent: viewAllNote ? undefined : DEFAULT_NUM_NOTE,
    }),
    { enabled: false },
  )

  useEffect(() => {
    refetch()
  }, [source, entityId, sort, filter, viewAllNote])

  const notes = viewAllNote ? data || [] : data?.items || []
  const totalNotes = data?.meta?.totalItems || 0

  function handleChangeSelect(value: string) {
    if (['first', 'last'].includes(value)) {
      setSort(value as SortNoteType)
    } else {
      setFilter(value as FilterNoteType)
    }

    setViewAllNote(false)
    setShowPrevious(true)
  }

  const handleViewPrevious = () => {
    setViewAllNote(true)
    setShowPrevious(false)
  }

  const checkShowPreviousNotes = () => {
    return showPrevious && notes.length > 0 && totalNotes > DEFAULT_NUM_NOTE
  }

  const PreviousNotes = () => (
    <div
      className="w-full bg-[#f8f8f8] flex flex-row py-2 px-4 mb-4 justify-between group relative cursor-pointer text-[12px]"
      onClick={handleViewPrevious}
    >
      <div className="text-blue-500">View All Previous Notes</div>
      <div className="text-gray-500">
        {DEFAULT_NUM_NOTE} of {totalNotes}
      </div>
      <div className="group-hover:bg-gray-200 group-hover:h-[1px] absolute bottom-0 w-full left-0"></div>
    </div>
  )

  return (
    <div className="p-4 border rounded-md">
      <div
        className="font-semibold mb-4 max-w-[720px] flex flex-row justify-between"
        id={id}
      >
        <div className="text-[17px]">{id}</div>
        <Select
          defaultValue={sort}
          onChange={handleChangeSelect}
          size="small"
          className="w-[160px]"
        >
          {hasFilter && (
            <OptGroup label="Filter">
              <Option value={moduleName}>
                {toCapitalizedWords(`${moduleName} Only`)}
              </Option>
              <Option value={undefined}>All</Option>
            </OptGroup>
          )}
          <OptGroup label="Sort">
            <Option value="first">Recent First</Option>
            <Option value="last">Recent Last</Option>
          </OptGroup>
        </Select>
      </div>
      <div
        className={`max-w-[720px] flex gap-3 ${
          sort === 'first' ? 'flex-col' : 'flex-col-reverse'
        }`}
      >
        {showNoteAdder && <NoteAdder entityId={entityId} source={source} />}

        <div className="mb-2 flex flex-col gap-4">
          {notes.length
            ? notes.map((item: Note) => {
                const {
                  createdAt,
                  owner,
                  content,
                  title,
                  id,
                  source,
                  attachments,
                  entity,
                } = item
                return (
                  <NoteContent
                    key={id}
                    time={createdAt}
                    author={owner?.name || 'Unknown User'}
                    note={content}
                    title={title}
                    setShowNoteAdder={setShowNoteAdder}
                    hideEditButton={!showNoteAdder}
                    noteId={id}
                    noteSource={source}
                    entity={entity}
                    files={attachments}
                  />
                )
              })
            : null}
        </div>
        {checkShowPreviousNotes() && <PreviousNotes />}
      </div>
    </div>
  )
}
