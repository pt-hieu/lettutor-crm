import React, { ReactNode } from 'react'

import { FieldMeta, FieldType } from '@utils/models/module'

const Input: React.FC<{ className?: string }> = ({ children, className }) => {
  return (
    <div
      className={`border rounded-md h-10 w-[200px] flex justify-end items-center text-gray-300 pr-3 ${
        className ? className : ''
      }`}
    >
      {children}
    </div>
  )
}

const FieldByType: Record<FieldType, ReactNode> = {
  [FieldType.EMAIL]: <Input />,
  [FieldType.PHONE]: <Input />,
  [FieldType.TEXT]: <Input />,
  [FieldType.RELATION]: <Input />,
  [FieldType.CHECK_BOX]: <Input className="!w-10" />,
  [FieldType.MULTILINE_TEXT]: <Input className="h-[80px]" />,
  [FieldType.NUMBER]: (
    <Input>
      <div className="flex flex-col">
        <span className="fa fa-caret-up"></span>
        <span className="fa fa-caret-down"></span>
      </div>
    </Input>
  ),
  [FieldType.SELECT]: (
    <Input>
      <span className="fa fa-caret-down"></span>
    </Input>
  ),
  [FieldType.DATE]: (
    <Input>
      <span className="fa fa-calendar"></span>
    </Input>
  ),
}

type Props = {
  field: FieldMeta
}

export const FieldPresentation = ({ field }: Props) => {
  return (
    <div className="flex">
      <label
        className={`crm-label mt-[10px] w-[120px] truncate pr-2 capitalize ${
          field.required ? '' : "after:content-['']"
        } `}
      >
        {field.name}
      </label>
      <div>{FieldByType[field.type]}</div>
    </div>
  )
}
