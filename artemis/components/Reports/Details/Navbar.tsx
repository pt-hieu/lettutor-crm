import moment from 'moment'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import Input from '@utils/components/Input'
import { StaticDateByType } from '@utils/data/report-data'
import { StaticTime, TimeFieldName, TimeFieldType } from '@utils/models/reports'

type TReportFilterData = {
  timeFieldName?: string
  timeFieldType?: string
  startDate?: Date | string
  endDate?: Date | string
  singleDate?: Date | string
}

const mappedTimeFieldNames: Record<TimeFieldName, string> = {
  [TimeFieldName.CLOSING_DATE]: 'Closing Date',
  [TimeFieldName.CREATED_AT]: 'Created Time',
  [TimeFieldName.UPDATED_AT]: 'Updated Time',
}

const singleDayTypes = [
  StaticTime.Yesterday,
  StaticTime.Today,
  StaticTime.Tomorrow,
  TimeFieldType.EXACT,
  TimeFieldType.IS_AFTER,
  TimeFieldType.IS_BEFORE,
] as string[]

const timeFieldTypeOptions: string[] = [
  ...Object.values(TimeFieldType),
  ...Object.values(StaticTime),
]

const defaultDates = {
  startDate: moment().format('yyyy-MM-DD'),
  endDate: moment().format('yyyy-MM-DD'),
  singleDate: moment().format('yyyy-MM-DD'),
}

const defaultValues: TReportFilterData = {
  timeFieldName: TimeFieldName.CLOSING_DATE,
  timeFieldType: TimeFieldType.EXACT,
  ...defaultDates,
}

const ReportNavbar = () => {
  const [isSingleDay, setIsSingleDay] = useState(true)
  const { handleSubmit, register, reset, getValues } =
    useForm<TReportFilterData>({ defaultValues })

  const {
    query: { type: reportName },
  } = useRouter()

  const handleApply = handleSubmit((data) => {
    console.log(data)
  })

  const getDatesByType = (type: string): string | [string, string] | null => {
    if (type in StaticDateByType) {
      return StaticDateByType[type as StaticTime]
    }
    return null
  }

  const handleChangeTimeFieldType = (value: string) => {
    setIsSingleDay(singleDayTypes.includes(value || ''))
    const timeFieldName = getValues('timeFieldName')
    const dates = getDatesByType(value)
    if (!dates) {
      reset({ ...defaultDates, timeFieldName })
      return
    }
    if (Array.isArray(dates)) {
      reset({ startDate: dates[0], endDate: dates[1], timeFieldName })
      return
    }
    reset({ singleDate: dates, timeFieldName })
  }

  const handleResetFilter = () => {
    reset(defaultValues)
  }

  useEffect(() => {
    setIsSingleDay(singleDayTypes.includes(getValues('timeFieldType') || ''))
  }, [getValues('timeFieldType')])

  console.log(defaultValues)

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] flex items-center gap-4 px-[60px]">
      <div className="font-semibold text-[17px]">{reportName}</div>
      <form className="p-2 flex gap-2 items-center" onSubmit={handleApply}>
        <div>
          <Input
            showError={false}
            as="select"
            props={{
              className: 'w-full',
              ...register('timeFieldName'),
              children: (
                <>
                  {Object.entries(mappedTimeFieldNames).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </>
              ),
            }}
          />
        </div>
        <div>
          <Input
            showError={false}
            as="select"
            props={{
              className: 'w-full',
              ...register('timeFieldType', {
                onChange: (e) => handleChangeTimeFieldType(e.target.value),
              }),
              children: (
                <>
                  {timeFieldTypeOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </>
              ),
            }}
          />
        </div>
        {isSingleDay ? (
          <div>
            <Input
              showError={false}
              props={{
                type: 'date',
                className: 'w-full',
                ...register('singleDate'),
              }}
            />
          </div>
        ) : (
          <>
            <div>
              <Input
                showError={false}
                props={{
                  type: 'date',
                  className: 'w-full',
                  ...register('startDate'),
                }}
              />
            </div>
            <div>
              <Input
                showError={false}
                props={{
                  type: 'date',
                  className: 'w-full',
                  ...register('endDate'),
                }}
              />
            </div>
          </>
        )}

        <button className="crm-button">Apply</button>
        <button className="crm-button-secondary" onClick={handleResetFilter}>
          Reset
        </button>
      </form>
    </div>
  )
}

export default ReportNavbar
