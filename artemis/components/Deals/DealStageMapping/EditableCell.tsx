import { Form, FormInstance, Input, Select } from 'antd'
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

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const values = await form.validateFields()

      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        // rules={[
        //   {
        //     required: true,
        //     message: `${title} is required.`,
        //   },
        // ]}
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
