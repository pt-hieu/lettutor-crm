import { Select } from 'antd'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Sections } from '@components/Details/Sidebar'
import { toCapitalizedWords } from '@components/Module/OverviewView'

import { Note } from '@utils/models/note'
import { SortNoteType, getNotes } from '@utils/service/note'

import { NoteAdder } from './NoteAdder'
import { NoteContent } from './NoteContent'

const { Option, OptGroup } = Select

interface IProps {
  id: Sections
  entityId: string
  moduleName: string
  hasFilter?: boolean
}

export const DEFAULT_NUM_NOTE = 3

export const NoteSection = ({
  id,
  entityId,
  hasFilter = false,
  moduleName,
}: IProps) => {
  const [showNoteAdder, setShowNoteAdder] = useState(true)
  const [filter, setFilter] = useState<string>()
  const [sort, setSort] = useState<SortNoteType>('first')
  const [showPrevious, setShowPrevious] = useState(true)
  const [viewAllNote, setViewAllNote] = useState(false)

  const { data, refetch } = useQuery<any>(
    [entityId, 'notes'],
    getNotes({
      source: moduleName,
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
  }, [moduleName, entityId, sort, filter, viewAllNote])

  const notes = viewAllNote ? data || [] : data?.items || []
  const totalNotes = data?.meta?.totalItems || 0

  function handleChangeSelect(value: string) {
    if (['first', 'last'].includes(value)) {
      setSort(value as SortNoteType)
    } else {
      setFilter(value)
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

  const PreviousNotes = (
    <button
      className="w-full bg-[#f8f8f8] flex flex-row py-2 px-4 mb-4 justify-between group relative cursor-pointer text-[12px]"
      onClick={handleViewPrevious}
    >
      <div className="text-blue-500">View All Previous Notes</div>
      <div className="text-gray-500">
        {DEFAULT_NUM_NOTE} of {totalNotes}
      </div>
      <div className="group-hover:bg-gray-200 group-hover:h-[1px] absolute bottom-0 w-full left-0"></div>
    </button>
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
        {showNoteAdder && <NoteAdder entityId={entityId} source={moduleName} />}

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
                  task,
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
                    entity={entity || task}
                    files={attachments}
                  />
                )
              })
            : null}
        </div>
        {checkShowPreviousNotes() && PreviousNotes}
      </div>
    </div>
  )
}
