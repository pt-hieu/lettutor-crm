import { LeadDetailSections } from '@components/Leads/LeadDetailSidebar'
import { Note, NoteSource } from '@utils/models/note'
import { FilterNoteType, SortNoteType } from '@utils/service/note'
import { Select } from 'antd'
import { useState } from 'react'
import { INoteData, NoteAdder } from './NoteAdder'
import { NoteContent } from './NoteContent'
const { Option, OptGroup } = Select

enum Filter {
  All = 'All',
  Only = 'Only',
}

enum Sort {
  RecentFirst = 'Recent First',
  RecentLast = 'Recent Last',
}

interface IProps {
  noteFor: NoteSource
  hasFilter?: boolean
  onAddNote: (data: INoteData) => void
  onEditNote: (noteId: string, data: INoteData) => void
  onDeleteNote: (noteId: string) => void
  onChangeFilterSort: ({
    sort,
    filter,
  }: {
    sort: SortNoteType
    filter?: FilterNoteType
  }) => void
  onViewAllNote: (value: boolean) => void
  notes: Note[]
  totalNotes: number
}

export const DEFAULT_NUM_NOTE = 3

export const NoteSection = ({
  noteFor,
  hasFilter = false,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onChangeFilterSort,
  onViewAllNote,
  notes,
  totalNotes,
}: IProps) => {
  const [showNoteAdder, setShowNoteAdder] = useState(true)
  const [filter, setFilter] = useState<Filter>(Filter.All)
  const [sort, setSort] = useState<Sort>(Sort.RecentFirst)
  const [showPrevious, setShowPrevious] = useState(true)

  function handleChangeSelect(value: string) {
    if (Object.values(Sort).includes(value as Sort)) {
      setSort(value as Sort)
      const filterParam = filter === Filter.All ? undefined : noteFor
      if (value === Sort.RecentFirst) {
        onChangeFilterSort({ sort: 'first', filter: filterParam })
      } else if (value === Sort.RecentLast) {
        onChangeFilterSort({ sort: 'last', filter: filterParam })
      }
    }

    if (Object.values(Filter).includes(value as Filter)) {
      setFilter(value as Filter)
      const sortParam = sort === Sort.RecentFirst ? 'first' : 'last'
      if (value === Filter.All) {
        onChangeFilterSort({ sort: sortParam, filter: undefined })
      } else if (value === Filter.Only) {
        onChangeFilterSort({ sort: sortParam, filter: noteFor })
      }
    }

    onViewAllNote(false)
    setShowPrevious(true)
  }

  const handleViewPrevious = () => {
    onViewAllNote(true)
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
    <div className="pt-4">
      <div
        className="font-semibold mb-4 max-w-[720px] flex flex-row justify-between"
        id={LeadDetailSections.Notes}
      >
        <div className="text-[17px]">{LeadDetailSections.Notes}</div>
        <Select
          defaultValue={sort}
          onChange={handleChangeSelect}
          size="small"
          className="w-[160px]"
        >
          {hasFilter && (
            <OptGroup label="Filter">
              {Object.values(Filter).map((item) => (
                <Option value={item} key={item}>
                  <span className="capitalize">
                    {item === Filter.Only ? `${noteFor} ${item}` : item}
                  </span>
                </Option>
              ))}
            </OptGroup>
          )}
          <OptGroup label="Sort">
            {Object.values(Sort).map((item) => (
              <Option value={item} key={item}>
                {item}
              </Option>
            ))}
          </OptGroup>
        </Select>
      </div>
      <div
        className={`max-w-[720px] flex gap-3 ${
          sort === Sort.RecentFirst ? 'flex-col' : 'flex-col-reverse'
        }`}
      >
        {showNoteAdder && <NoteAdder onAddNote={onAddNote} />}

        <div className="mb-2 flex flex-col gap-4">
          {notes.map((item) => {
            const { createdAt, owner, content, title, id, source, attachments } = item
            return (
              <NoteContent
                key={id}
                time={createdAt}
                author={owner?.name || 'Unknown User'}
                note={content}
                title={title}
                setShowNoteAdder={setShowNoteAdder}
                hideEditButton={!showNoteAdder}
                onEditNote={onEditNote}
                onDeleteNote={onDeleteNote}
                noteId={id}
                noteSource={source}
                sourceName={item[source]?.fullName as string}
                sourceId={item[source]?.id as string}
                files={attachments}
              />
            )
          })}
        </div>
        {checkShowPreviousNotes() && <PreviousNotes />}
      </div>
    </div>
  )
}
