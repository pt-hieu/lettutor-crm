import { Form, FormInstance, Input, Select } from 'antd'
import { Rule } from 'antd/lib/form'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { TData } from './DealStageTable'

const { Option } = Select

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface Item extends TData {}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  children: React.ReactNode
  dataIndex: keyof Item
  record: Item
  handleSave: (record: Item) => void
  as?: 'input' | 'select'
  selectSource?: string[]
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  as,
  selectSource,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing) {
      inputRef.current && inputRef.current.focus()
    }
  }, [editing])

  useEffect(() => {
    if (dataIndex === 'name' && !record[dataIndex]) {
      setEditing(true)
    }
  }, [])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const value = form.getFieldValue(dataIndex)
      if (value?.trim() === record[dataIndex]) return

      const values = await form.validateFields()
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    } finally {
      toggleEdit()
    }
  }

  let childNode = children

  const probabilityRules: Rule[] = [
    {
      required: true,
      message: `Probability is required.`,
    },
    {
      pattern: /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/g,
      message: `Probability must be in range 0-100`,
    },
  ]

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={
          dataIndex === 'probability'
            ? probabilityRules
            : [
                {
                  required: true,
                  whitespace: true,
                  message: `${title} is required.`,
                },
              ]
        }
      >
        {as === 'select' ? (
          <Select ref={inputRef} onChange={save} onBlur={save} open>
            {selectSource?.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        ) : (
          <Input
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            className="w-full"
            maxLength={dataIndex === 'probability' ? 5 : undefined}
          />
        )}
      </Form.Item>
    ) : (
      <div
        className="py-1 cursor-pointer border rounded-sm border-transparent hover:border-[#d9d9d9] -mx-1 px-1 w-full min-h-[32px] relative group"
        onClick={toggleEdit}
      >
        {as === 'select' && (
          <i className="fa fa-angle-down absolute right-2 top-0 hidden group-hover:block text-gray-400 translate-y-[50%]" />
        )}
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

interface EditableRowProps {
  index: number
}

export const EditableRow: React.FC<EditableRowProps> = ({
  index,
  ...props
}) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}
