import moment from 'moment'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import Input from '@utils/components/Input'
import { StaticDateByType } from '@utils/data/report-data'
import { StaticTime, TimeFieldName, TimeFieldType } from '@utils/models/reports'

export type TReportFilterData = {
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

interface IProps {
  defaultValues?: TReportFilterData
}

export const ReportFilter = ({ defaultValues }: IProps) => {
  const [isSingleDay, setIsSingleDay] = useState(true)
  const [isNoTimeFieldName, setIsNoTimeFieldName] = useState(true)
  const [isNoTimeFieldType, setIsNoTimeFieldType] = useState(true)

  const { handleSubmit, register, reset, getValues, setValue } =
    useForm<TReportFilterData>({ defaultValues })

  const handleApply = handleSubmit((data) => {
    if (isNoTimeFieldName || isNoTimeFieldType) {
      console.log({})
      return
    }
    const formattedData = formatReportFilter(data)
    console.log(formattedData)
  })

  const getDatesByType = (type: string): string | [string, string] | null => {
    if (type in StaticDateByType) {
      return StaticDateByType[type as StaticTime]
    }
    return null
  }

  const setFilterValuesByTimeFieldType = (type: string) => {
    const dates = getDatesByType(type)
    if (!dates) {
      reset({ ...getValues(), ...defaultDates })
      return
    }
    if (Array.isArray(dates)) {
      setValue('startDate', dates[0])
      setValue('endDate', dates[1])
      return
    }
    setValue('singleDate', dates)
  }

  const handleChangeTimeFieldType = (value: string) => {
    setIsNoTimeFieldType(!value)
    setIsSingleDay(singleDayTypes.includes(value || ''))
    setFilterValuesByTimeFieldType(value)
  }

  const handleChangeTimeFieldName = (value: string) => {
    if (!value) {
      setValue('timeFieldType', '')
      setIsNoTimeFieldType(true)
    }
    setIsNoTimeFieldName(!value)
  }

  const handleResetFilter = () => {
    reset(defaultDates)
    setIsNoTimeFieldName(true)
  }

  useEffect(() => {
    const { timeFieldType, timeFieldName } = defaultValues || {}
    setFilterValuesByTimeFieldType(timeFieldType || '')
    setIsNoTimeFieldName(!timeFieldName)
    setIsNoTimeFieldType(!timeFieldType)
    setIsSingleDay(singleDayTypes.includes(timeFieldType || ''))
  }, [])

  const isStaticTime = Object.values(StaticTime).includes(
    getValues('timeFieldType') as StaticTime,
  )

  return (
    <form className="p-2 flex gap-2 items-center" onSubmit={handleApply}>
      <div>
        <Input
          showError={false}
          as="select"
          props={{
            className: 'w-full',
            ...register('timeFieldName', {
              onChange: (e) => handleChangeTimeFieldName(e.target.value),
            }),
            children: (
              <>
                <option key="None" value="">
                  None
                </option>
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
            disabled: isNoTimeFieldName,
            className: 'w-full',
            ...register('timeFieldType', {
              required: !isNoTimeFieldName,
              onChange: (e) => handleChangeTimeFieldType(e.target.value),
            }),
            children: (
              <>
                <option key="None" value="">
                  None
                </option>
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
      {isNoTimeFieldType || isNoTimeFieldName ? null : isSingleDay ? (
        <div>
          <Input
            showError={false}
            props={{
              disabled: isStaticTime,
              type: 'date',
              className: 'w-full',
              ...register('singleDate', {
                required: !isStaticTime,
              }),
            }}
          />
        </div>
      ) : (
        <>
          <div>
            <Input
              showError={false}
              props={{
                disabled: isStaticTime,
                type: 'date',
                className: 'w-full',
                ...register('startDate', {
                  required: !isStaticTime,
                }),
              }}
            />
          </div>
          <div>
            <Input
              showError={false}
              props={{
                disabled: isStaticTime,
                type: 'date',
                className: 'w-full',
                ...register('endDate', {
                  required: !isStaticTime,
                }),
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
  )
}

function formatReportFilter(data: TReportFilterData) {
  const filter = { ...data }
  let { timeFieldType } = filter

  if (!Object.values(TimeFieldType).includes(timeFieldType as TimeFieldType)) {
    if (singleDayTypes.includes(timeFieldType || '')) {
      timeFieldType = TimeFieldType.EXACT
    } else {
      timeFieldType = TimeFieldType.BETWEEN
    }
  }

  if (singleDayTypes.includes(timeFieldType || '')) {
    delete filter.startDate
    delete filter.endDate
  } else {
    delete filter.singleDate
  }

  return { ...filter, timeFieldType }
}
