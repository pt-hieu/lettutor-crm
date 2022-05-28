import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import Input from '@utils/components/Input'
import { StaticDateByType } from '@utils/data/report-data'
import {
  StaticTime,
  TReportFilterData,
  TimeFieldName,
  TimeFieldType,
} from '@utils/models/reports'

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
  defaultValues: TReportFilterData
  onFilter: (value: TReportFilterData) => void
  moduleName: string
}

const getDatesByType = (type: string): string | [string, string] | null => {
  if (type in StaticDateByType) {
    return StaticDateByType[type as StaticTime]
  }
  return null
}

export const ReportFilter = ({
  defaultValues,
  onFilter,
  moduleName,
}: IProps) => {
  const { timeFieldType, timeFieldName } = defaultValues
  const [isNoTimeFieldName, setIsNoTimeFieldName] = useState(!timeFieldName)
  const [isNoTimeFieldType, setIsNoTimeFieldType] = useState(!timeFieldType)
  const [isSingleDay, setIsSingleDay] = useState(
    singleDayTypes.includes(timeFieldType || ''),
  )
  const [isStaticTime, setIsStaticTime] = useState(
    Object.values(StaticTime).includes(timeFieldType as StaticTime),
  )

  const { handleSubmit, register, reset, getValues, setValue } =
    useForm<TReportFilterData>({ defaultValues })

  const handleApply = handleSubmit((data) => {
    if (isNoTimeFieldName || isNoTimeFieldType) {
      return
    }
    onFilter(data)
  })

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
    setIsStaticTime(Object.values(StaticTime).includes(value as StaticTime))
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
    setIsNoTimeFieldType(true)
    onFilter({})
  }

  useEffect(() => {
    const { timeFieldType } = defaultValues
    setFilterValuesByTimeFieldType(timeFieldType || '')
  }, [])

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
                {Object.entries(mappedTimeFieldNames)
                  .filter(
                    ([key]) =>
                      !(
                        moduleName === 'lead' &&
                        key === TimeFieldName.CLOSING_DATE
                      ),
                  )
                  .map(([key, value]) => (
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

      <button
        className="crm-button"
        disabled={isNoTimeFieldName || isNoTimeFieldType}
      >
        Apply
      </button>
      {!isNoTimeFieldName && !isNoTimeFieldType && (
        <button className="crm-button-secondary" onClick={handleResetFilter}>
          Reset
        </button>
      )}
    </form>
  )
}

export function formatReportFilter(data: TReportFilterData) {
  const filter = { ...data }
  let { timeFieldType } = filter

  if (!Object.values(TimeFieldType).includes(timeFieldType as TimeFieldType)) {
    if (singleDayTypes.includes(timeFieldType || '')) {
      filter.timeFieldType = TimeFieldType.EXACT
    } else {
      filter.timeFieldType = TimeFieldType.BETWEEN
    }
  }

  if (singleDayTypes.includes(timeFieldType || '')) {
    delete filter.startDate
    delete filter.endDate
  } else {
    delete filter.singleDate
  }

  const { startDate, endDate, singleDate } = filter
  if (!startDate && !endDate && !singleDate) delete filter.timeFieldType

  return filter
}
