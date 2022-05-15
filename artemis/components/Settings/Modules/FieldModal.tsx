import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import SuggestInput from '@utils/components/SuggestInput'
import { FieldMeta, FieldType, RelateType } from '@utils/models/module'
import { getModules } from '@utils/service/module'

type Props = {
  visible: boolean
  close: () => void
  data: FieldMeta | undefined
  group: string | undefined
  type: FieldType | undefined
  onSubmit: (data: FieldMeta) => any
}

const Views = ['Overview', 'Update', 'Create', 'Detail'] as const

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
})

export default function FieldModal({
  close,
  visible,
  data,
  type,
  group,
  onSubmit,
}: Props) {
  const { name } = data || {}

  const isUpdating = !!data
  const title = isUpdating ? `Update Field ${name}` : `Create A ${type} Field`

  const [optionsCount, setOptionCount] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FieldMeta>({
    resolver: yupResolver(schema),
  })

  const { data: modules } = useQuery('modules', getModules(), {
    enabled: false,
    select: (m) => m.map((m) => m.name).concat('task', 'dealstage', 'user'),
  })

  useEffect(() => {
    if (!visible) return

    reset(data || {})
    setOptionCount(data?.options?.length || 1)
  }, [visible])

  useEffect(() => {
    if (!visible) return
    if (isUpdating) return

    setValue('group', group || '')
  }, [visible])

  useEffect(() => {
    if (visible) return

    reset()
    setOptionCount(1)
  }, [visible])

  return (
    <Modal visible={visible} footer={null} centered onCancel={close}>
      <div className="font-medium text-xl">{title}</div>
      <Divider />

      <form className="flex flex-col gap-3 overflow-auto max-h-[550px]">
        <div className="font-medium">General</div>

        <div className="grid grid-cols-[80px,1fr] gap-4 w-full">
          <label htmlFor="name" className="crm-label pt-[10px]">
            Name
          </label>
          <Input
            wrapperClassname="w-full"
            error={errors['name']?.message}
            props={{
              type: 'text',
              id: 'name',
              disabled: isUpdating,
              className: 'w-full',
              ...register('name'),
            }}
          />
        </div>

        <div className="grid grid-cols-[80px,1fr] gap-4 w-full">
          <label htmlFor="group" className="crm-label after:contents pt-[10px]">
            Group
          </label>
          <Input
            wrapperClassname="w-full"
            error={errors['group']?.message}
            props={{
              type: 'text',
              id: 'group',
              disabled: true,
              className: 'w-full',
              ...register('group'),
            }}
          />
        </div>

        {type === FieldType.SELECT && (
          <>
            <Divider />
            <div className="flex items-center justify-between">
              Select Options
              <button
                type="button"
                onClick={() => setOptionCount((c) => c + 1)}
                className="w-fit mb-2 ml-auto crm-button"
              >
                <span className="fa fa-plus mr-2" />
                Add Option
              </button>
            </div>

            <div className="border border-dashed p-4 rounded-md flex flex-col gap-4">
              {Array(optionsCount)
                .fill('')
                .map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[80px,1fr] gap-4 w-full"
                  >
                    <label
                      htmlFor={`option.${index}`}
                      className="crm-label after:contents pt-[10px]"
                    >
                      Option {index + 1}
                    </label>
                    <Input
                      wrapperClassname="w-full"
                      // @ts-ignore
                      error={errors[`options.${index}`]?.message}
                      props={{
                        type: 'text',
                        id: `option.${index}`,
                        className: 'w-full',
                        ...register(`options.${index}`),
                      }}
                    />
                  </div>
                ))}
            </div>
          </>
        )}

        {type === FieldType.RELATION && (
          <>
            <Divider />
            <div className="font-medium">Relation Configs</div>

            <div className="border border-dashed p-4 rounded-md flex flex-col gap-4">
              <div className="grid grid-cols-[80px,1fr] gap-4 w-full">
                <label htmlFor="relateType" className="crm-label pt-[10px]">
                  Type
                </label>
                <Input
                  wrapperClassname="w-full"
                  error={errors['relateType']?.message}
                  as="select"
                  props={{
                    id: 'relateType',
                    className: 'w-full',
                    ...register('relateType'),
                    children: (
                      <>
                        {Object.values(RelateType).map((type) => (
                          <option value={type} key={type}>
                            {type}
                          </option>
                        ))}
                      </>
                    ),
                  }}
                />
              </div>

              <div className="grid grid-cols-[80px,1fr] gap-4 w-full">
                <label htmlFor="relateTo" className="crm-label pt-[10px]">
                  To
                </label>
                <SuggestInput
                  error={errors['relateTo']?.message}
                  getData={modules || []}
                  onItemSelect={(moduleName) =>
                    setValue('relateTo', moduleName)
                  }
                  getKey={(name) => name}
                  filter={(moduleName, query) =>
                    moduleName
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase())
                  }
                  render={(item) => <span className="capitalize">{item}</span>}
                  mapValue={(v) => v.charAt(0).toLocaleUpperCase() + v.slice(1)}
                  inputProps={{
                    className: 'w-full',
                    id: 'relateTo',
                    ...register('relateTo'),
                  }}
                />
              </div>
            </div>
          </>
        )}

        <Divider />
        <div className="font-medium">Visibility</div>

        <div className="border border-dashed p-4 rounded-md grid grid-cols-2 gap-4">
          {Views.map((view) => (
            <div
              key={view}
              className="grid grid-cols-[80px,1fr] items-center gap-4 w-full"
            >
              <label
                htmlFor={`visibility.${view}`}
                className="crm-label after:contents pt-[10px]"
              >
                {view}
              </label>
              <Input
                wrapperClassname="w-full"
                // @ts-ignore
                error={errors[`visibility.${view}`]?.message}
                props={{
                  type: 'checkbox',
                  id: `visibility.${view}`,
                  ...register(`visibility.${view}`),
                }}
              />
            </div>
          ))}
        </div>

        <Divider />
        <div className="font-medium">Constraints</div>

        <div className="border border-dashed p-4 rounded-md grid grid-cols-2 gap-4">
          <div className="grid grid-cols-[80px,1fr] items-center gap-4 w-full col-span-2">
            <label
              htmlFor="required"
              className="crm-label after:contents pt-[10px]"
            >
              Required
            </label>
            <Input
              wrapperClassname="w-full"
              error={errors['required']?.message}
              props={{
                type: 'checkbox',
                id: 'required',
                ...register('required'),
              }}
            />
          </div>

          {(type === FieldType.TEXT || type === FieldType.MULTILINE_TEXT) && (
            <>
              <div className="grid grid-cols-[120px,1fr] col-span-2 gap-4 w-full">
                <label
                  htmlFor="minLength"
                  className="crm-label after:contents pt-[10px]"
                >
                  Min Length
                </label>
                <Input
                  wrapperClassname="w-full"
                  error={errors['minLength']?.message}
                  props={{
                    type: 'number',
                    id: 'minLength',
                    className: 'w-full',
                    ...register('minLength'),
                  }}
                />
              </div>

              <div className="grid grid-cols-[120px,1fr] col-span-2 gap-4 w-full">
                <label
                  htmlFor="maxLength"
                  className="crm-label after:contents pt-[10px]"
                >
                  Max Length
                </label>
                <Input
                  wrapperClassname="w-full"
                  error={errors['maxLength']?.message}
                  props={{
                    type: 'number',
                    id: 'maxLength',
                    className: 'w-full',
                    ...register('maxLength'),
                  }}
                />
              </div>
            </>
          )}

          {type === FieldType.NUMBER && (
            <>
              <div className="grid grid-cols-[80px,1fr] col-span-2 gap-4 w-full">
                <label
                  htmlFor="min"
                  className="crm-label after:contents pt-[10px]"
                >
                  Min
                </label>
                <Input
                  wrapperClassname="w-full"
                  error={errors['min']?.message}
                  props={{
                    type: 'number',
                    id: 'min',
                    className: 'w-full',
                    ...register('min'),
                  }}
                />
              </div>

              <div className="grid grid-cols-[80px,1fr] col-span-2 gap-4 w-full">
                <label
                  htmlFor="max"
                  className="crm-label after:contents pt-[10px]"
                >
                  Max
                </label>
                <Input
                  wrapperClassname="w-full"
                  error={errors['max']?.message}
                  props={{
                    type: 'number',
                    id: 'max',
                    className: 'w-full',
                    ...register('max'),
                  }}
                />
              </div>
            </>
          )}
        </div>
      </form>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={close} className="crm-button-outline">
          Cancel
        </button>

        <button
          onClick={handleSubmit((data) => onSubmit(data))}
          className="crm-button"
        >
          Submit
        </button>
      </div>
    </Modal>
  )
}
