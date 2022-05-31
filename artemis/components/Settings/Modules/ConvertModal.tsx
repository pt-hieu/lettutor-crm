import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal } from 'antd'
import { uniqueId } from 'lodash'
import {
  ElementRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as yup from 'yup'

import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { useDispatch } from '@utils/hooks/useDispatch'
import { ConvertMeta, Module } from '@utils/models/module'

import PropertyMapping from './PropertyMapping'

type Props = {
  visible: boolean
  close: () => void
  module: Module | undefined
}

const schema = yup.object().shape({
  meta: yup.array().of(
    yup.object().shape({
      source: yup.string().required('Source is required'),
    }),
  ),
})

export default function ConvertModal({ close, visible, module }: Props) {
  const { convert_meta, name } = module || {}
  const { reset, handleSubmit, control, ...form } = useForm<{
    meta: ConvertMeta[]
  }>({
    resolver: yupResolver(schema),
  })

  const ref = useRef<ElementRef<typeof PropertyMapping>>(null)

  const [keys, setKeys] = useState(
    () => convert_meta?.map(() => uniqueId('asdasd2')) || [],
  )

  const [selectedSource, setSelectedSource] = useState<string | undefined>(
    convert_meta?.[0]?.source,
  )

  const currentIndex = useMemo(() => {
    const index = form
      .getValues()
      .meta?.findIndex((item) => item.source === selectedSource)

    if (selectedSource?.startsWith('New Source')) {
      return Number(selectedSource.replace('New Source ', '')) || 0
    }

    if (index === -1) return convert_meta?.length || 0
    return index || 0
  }, [selectedSource, convert_meta])

  useEffect(() => {
    if (!visible) return

    setKeys(convert_meta?.map(() => uniqueId('asdasd2')) || [])
    setSelectedSource(convert_meta?.[0]?.source)

    reset({ meta: [...(convert_meta || [])] })
    ref.current?.resetProp()
  }, [visible])

  useEffect(() => {
    ref.current?.resetProp()
  }, [selectedSource])

  const dispatch = useDispatch()

  const submitModule = useCallback(
    handleSubmit((data) => {
      close()
      dispatch('cmd:update-convert-setting', data)
    }),
    [],
  )

  const { data: modules } = useQuery<Pick<Module, 'name'>[]>('modules', {
    enabled: false,
  })

  const addSource = useCallback(() => {
    setKeys((k) => [...k, uniqueId('asdaqwe')])
  }, [])

  const removeSourceModule = useCallback(() => {
    const currentData = form.getValues().meta

    currentData.splice(currentIndex, 1)
    reset({ meta: [...currentData] })

    setKeys((keys) => keys.filter((_, index) => index !== currentIndex))
    if (keys.length)
      setSelectedSource(convert_meta?.[Math.max(currentIndex - 1, 0)]?.source)
  }, [currentIndex, keys])

  return (
    <Modal
      destroyOnClose
      visible={visible}
      onCancel={close}
      centered
      footer={false}
    >
      <div className="font-medium text-xl">Convert Setting</div>
      <Divider />

      {!keys.length && (
        <div className="flex flex-col items-center">
          <div>This module has not been enabled its convert feature</div>
          <button onClick={addSource} className="mt-2 crm-button">
            <span className="fa fa-plus mr-2" />
            Add Source
          </button>
        </div>
      )}

      <div key={selectedSource + 'asd'} className="mb-4 flex gap-2">
        {keys.map((key, index) => (
          <button
            onClick={() =>
              setSelectedSource(
                form.watch(`meta.${index}.source`) ||
                  convert_meta?.[index]?.source ||
                  `New Source ${index}`,
              )
            }
            className={`${
              (form.watch(`meta.${index}.source`) ||
                convert_meta?.[index]?.source ||
                `New Source ${index}`) === selectedSource
                ? 'crm-button'
                : 'crm-button-outline'
            } capitalize`}
            key={key}
          >
            {form.watch(`meta.${index}.source`) ||
              convert_meta?.[index]?.source ||
              `New Source ${index}`}
          </button>
        ))}

        {!!keys.length && (
          <button onClick={addSource} className="crm-button-outline">
            <span className="fa fa-plus mr-2" />
            Add Source
          </button>
        )}
      </div>

      {!!keys.length && (
        <FormProvider
          reset={reset}
          handleSubmit={handleSubmit}
          control={control}
          {...form}
        >
          <form key={selectedSource}>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor={`${currentIndex}.source`} className="crm-label">
                  Source
                </label>

                <Controller
                  name={`meta.${currentIndex}.source`}
                  control={control}
                  render={({
                    field: { ref, ...field },
                    fieldState: { error },
                  }) => (
                    <Input
                      error={error?.message}
                      ref={ref}
                      as="select"
                      props={{
                        className: 'w-full',
                        disabled: !!convert_meta?.[currentIndex]?.source,
                        id: `${currentIndex}.source`,
                        ...field,
                        children: (
                          <>
                            <option value="">Select source module</option>

                            {field.value && (
                              <option value={field.value}>{field.value}</option>
                            )}

                            {modules
                              ?.filter(
                                (module) =>
                                  !form
                                    .getValues()
                                    .meta.some(
                                      ({ source }) => module.name === source,
                                    ) && module.name !== name,
                              )
                              .map((module) => (
                                <option value={module.name} key={module.name}>
                                  {module.name}
                                </option>
                              ))}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex gap-2">
                  <Controller
                    name={`meta.${currentIndex}.should_convert_note`}
                    control={control}
                    render={({
                      field: { value, ...field },
                      fieldState: { error },
                    }) => (
                      <Input
                        error={error?.message}
                        wrapperClassname="inline"
                        props={{
                          type: 'checkbox',
                          id: `meta.${currentIndex}.should_convert_note`,
                          checked: value || false,
                          ...field,
                        }}
                      />
                    )}
                  />

                  <label
                    htmlFor={`meta.${currentIndex}.should_convert_note`}
                    className="crm-label inline after:contents"
                  >
                    Convert Notes
                  </label>
                </div>

                <div className="flex gap-2">
                  <Controller
                    name={`meta.${currentIndex}.should_convert_attachment`}
                    control={control}
                    render={({
                      field: { value, ...field },
                      fieldState: { error },
                    }) => (
                      <Input
                        error={error?.message}
                        wrapperClassname="inline"
                        props={{
                          type: 'checkbox',
                          id: `${currentIndex}.should_convert_attachment`,
                          checked: value || false,
                          ...field,
                        }}
                      />
                    )}
                  />

                  <label
                    htmlFor={`${currentIndex}.should_convert_attachment`}
                    className="crm-label inline after:contents"
                  >
                    Convert Attachments
                  </label>
                </div>
              </div>

              <PropertyMapping
                ref={ref}
                index={currentIndex}
                item={convert_meta?.[currentIndex]}
              />
            </div>
          </form>
        </FormProvider>
      )}

      <Divider />

      <div className="mt-8 gap-2 flex items-center justify-between w-full">
        {!!convert_meta?.[currentIndex] && !!keys.length && (
          <Confirm
            message="Are you sure you want to remove this module?"
            onYes={removeSourceModule}
          >
            <button className="crm-button-outline">
              <span className="fa fa-trash" />
            </button>
          </Confirm>
        )}

        <div className="flex gap-2 ml-auto">
          {(!!keys.length || keys.length !== convert_meta?.length) && (
            <button onClick={submitModule} className="crm-button">
              <span className="fa fa-check mr-2" />
              Submit
            </button>
          )}

          <button onClick={close} className="crm-button-outline">
            <span className="fa fa-times mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
