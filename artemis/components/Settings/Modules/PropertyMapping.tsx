import { uniqueId } from 'lodash'
import { useRouter } from 'next/router'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useQuery } from 'react-query'

import Input from '@utils/components/Input'
import Tooltip from '@utils/components/Tooltip'
import { ConvertMeta, FieldType, Module } from '@utils/models/module'

type Props = {
  item: ConvertMeta
  index: number
}

type Ref = {
  resetProp: () => void
}

export default forwardRef<Ref, Props>(function PropertyMapping(
  { item, index: itemIndex },
  ref,
) {
  const [ids, setIds] = useState(
    Object.keys(item.meta).map(() => uniqueId('askdaskdj')),
  )

  const addProperty = useCallback(
    () => setIds((ids) => [...ids, uniqueId()]),
    [],
  )

  const removeProperty = useCallback((id: string) => {
    setIds((ids) => ids.filter((value) => value !== id))
  }, [])

  useImperativeHandle(ref, () => ({
    resetProp: () =>
      setIds(Object.keys(item.meta).map(() => uniqueId('askdaskdj'))),
  }))

  return (
    <div className="p-3 border border-dashed rounded-md">
      <div className="mb-2 flex justify-between items-center">
        <div className="font-medium">Detail</div>

        <Tooltip title="Add Property">
          <button
            onClick={addProperty}
            type="button"
            className="w-8 aspect-square rounded-full hover:bg-gray-300"
          >
            <span className="fa fa-plus"></span>
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2">
        {ids.map((id, index) => (
          <div key={id} className="flex gap-2 items-start">
            <Tooltip title="Remove this mapping">
              <button
                onClick={() => removeProperty(id)}
                className="w-8 aspect-square rounded-full hover:bg-gray-300 mt-[5px]"
              >
                <span className="fa fa-minus"></span>
              </button>
            </Tooltip>

            <PropertyInput
              index={itemIndex}
              item={item}
              initSourceProp={Object.keys(item.meta)[index]}
            />
          </div>
        ))}
      </div>
    </div>
  )
})

type PropertyInputProps = { initSourceProp?: string } & Pick<Props, 'index'> &
  Partial<Pick<Props, 'item'>>

const CompatibleField: Record<FieldType, FieldType[]> = {
  [FieldType.DATE]: [FieldType.DATE],
  [FieldType.CHECK_BOX]: [FieldType.CHECK_BOX],
  [FieldType.EMAIL]: [
    FieldType.EMAIL,
    FieldType.TEXT,
    FieldType.MULTILINE_TEXT,
  ],
  [FieldType.MULTILINE_TEXT]: [FieldType.MULTILINE_TEXT],
  [FieldType.NUMBER]: [
    FieldType.NUMBER,
    FieldType.TEXT,
    FieldType.MULTILINE_TEXT,
  ],
  [FieldType.PHONE]: [
    FieldType.EMAIL,
    FieldType.TEXT,
    FieldType.MULTILINE_TEXT,
  ],
  [FieldType.RELATION]: [FieldType.RELATION],
  [FieldType.SELECT]: [FieldType.TEXT, FieldType.MULTILINE_TEXT],
  [FieldType.TEXT]: [FieldType.TEXT, FieldType.MULTILINE_TEXT],
}

function PropertyInput({ index, item, initSourceProp }: PropertyInputProps) {
  const { query } = useRouter()
  const moduleName = query.moduleName as string

  const { control, getValues } = useFormContext<{ meta: ConvertMeta[] }>()
  const [sourceProp, setSourceProp] = useState(initSourceProp)

  const { data: modules } = useQuery<Module[]>('modules', {
    enabled: false,
  })

  const sourceModule = useMemo(
    () => modules?.find((module) => module.name === item?.source),
    [modules, item],
  )

  const currentModule = useMemo(
    () => modules?.find((module) => module.name === moduleName),
    [modules, moduleName],
  )

  const selectedField = useMemo(
    () => sourceModule?.meta?.find((field) => field.name === sourceProp),
    [sourceProp, sourceModule],
  )

  return (
    <div className="grid gap-2 grid-rows-2 w-full">
      <Input
        as="select"
        showError={false}
        props={{
          value: sourceProp,
          className: 'w-full',
          onChange: (e) => setSourceProp(e.target.value),
          children: (
            <>
              <option value="">Select Source Property</option>
              {sourceProp && <option value={sourceProp}>{sourceProp}</option>}

              {sourceModule?.meta
                ?.filter(
                  (field) =>
                    !Object.keys(getValues().meta?.[index].meta || {}).includes(
                      field.name,
                    ),
                )
                .map((field) => (
                  <option value={field.name} key={field.name}>
                    {field.name}
                  </option>
                ))}
            </>
          ),
        }}
      />

      {sourceProp && (
        <Controller
          control={control}
          name={`meta.${index}.meta.${sourceProp}`}
          rules={{
            required: {
              value: true,
              message: 'This value is missing',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <Input
              error={error?.message}
              as="select"
              props={{
                ...field,
                className: 'w-full',
                children: (
                  <>
                    <option value="">Select target property</option>
                    {currentModule?.meta
                      ?.filter((field) =>
                        CompatibleField[selectedField!.type].includes(
                          field.type,
                        ),
                      )
                      .map((field) => (
                        <option value={field.name} key={field.name}>
                          {field.name}
                        </option>
                      ))}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    </div>
  )
}
