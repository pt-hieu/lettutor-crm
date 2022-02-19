import { LeadDetailSections } from '@components/Leads/LeadDetailSidebar'
import { Select } from 'antd'
import { useMemo, useState } from 'react'
import { NoteAdder } from './NoteAdder'
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
  noteFor: 'Contact' | 'Account' | 'Lead' | 'Deal' | 'Task'
  hasFilter?: boolean
}

export const NoteSection = ({ noteFor, hasFilter = false }: IProps) => {
  const [showNoteAdder, setShowNoteAdder] = useState(true)
  const [filter, setFilter] = useState<Filter>(Filter.All)
  const [sort, setSort] = useState<Sort>(Sort.RecentFirst)

  function handleChangeSelect(value: string) {
    if (Object.values(Sort).includes(value as Sort)) {
      setSort(value as Sort)
    }
  }

  const PreviousNotes = () => (
    <div className="w-full bg-[#f8f8f8] flex flex-row py-2 px-4 mb-4 justify-between group relative cursor-pointer text-[12px]">
      <div className="text-blue-500">View Previous Notes</div>
      <div className="text-gray-500">3 of 22</div>
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
                  {item === Filter.Only ? `${noteFor} ${item}` : item}
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
        {showNoteAdder && <NoteAdder />}

        <div className="mb-2 flex flex-col gap-3">
          <NoteContent
            time="2022-02-19T08:44:39+0000"
            author="Le Hao"
            note="Abc asasas Lorem ipsum, dolor sit amet consectetur adipisicing
              elit. Ab saepe doloribus voluptas minima quibusdam nesciunt neque
              incidunt officiis amet sapiente, veniam quaerat dolor pariatur?
              Officiis repellendus quae ab molestias voluptate."
            setShowNoteAdder={setShowNoteAdder}
            hideEditButton={!showNoteAdder}
          />
          <NoteContent
            time="2021-12-19T11:44:39+0000"
            author="Le Hao"
            title="Title"
            note="Abc asasas Lorem ipsum, dolor sit amet consectetur adipisicing
              elit. Ab saepe doloribus voluptas minima quibusdam nesciunt neque
              incidunt officiis amet sapiente, veniam quaerat dolor pariatur?
              Officiis repellendus quae ab molestias voluptate."
            setShowNoteAdder={setShowNoteAdder}
            hideEditButton={!showNoteAdder}
          />
        </div>
        <PreviousNotes />
      </div>
    </div>
  )
}
