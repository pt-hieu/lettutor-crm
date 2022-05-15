import { Divider, Modal } from 'antd'
import { ElementRef, useCallback, useEffect, useRef } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from 'react-query'

import Input from '@utils/components/Input'
import { useDispatch } from '@utils/hooks/useDispatch'
import { ConvertMeta, Module } from '@utils/models/module'

import PropertyMapping from './PropertyMapping'

type Props = {
  visible: boolean
  close: () => void
  module: Module | undefined
}

export default function ConvertModal({ close, visible, module }: Props) {
  const { convert_meta } = module || {}
  const { reset, handleSubmit, control, ...form } = useForm<{
    meta: ConvertMeta[]
  }>({ shouldUnregister: true })

  const ref = useRef<ElementRef<typeof PropertyMapping>>(null)

  useEffect(() => {
    if (!visible) return
    reset({ meta: convert_meta })
    ref.current?.resetProp()
  }, [visible])

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

  return (
    <Modal visible={visible} onCancel={close} centered footer={false}>
      <div className="font-medium text-xl">Convert Setting</div>
      <Divider />

      {!convert_meta ||
        (!convert_meta.length && (
          <div>This module has not been enabled its convert feature</div>
        ))}

      <FormProvider
        reset={reset}
        handleSubmit={handleSubmit}
        control={control}
        {...form}
      >
        <form>
          {convert_meta?.map((item, index) => (
            <div key={item.source} className="flex flex-col gap-4">
              <div>
                <label htmlFor={`${index}.source`} className="crm-label">
                  Source
                </label>

                <Controller
                  name={`meta.${index}.source`}
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
                        disabled: true,
                        id: `${index}.source`,
                        ...field,
                        children: (
                          <>
                            {modules?.map((module) => (
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
                    name={`meta.${index}.should_convert_note`}
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
                          id: `${index}.should_convert_note`,
                          checked: value,
                          ...field,
                        }}
                      />
                    )}
                  />

                  <label
                    htmlFor={`meta.${index}.should_convert_note`}
                    className="crm-label inline after:contents"
                  >
                    Convert Notes
                  </label>
                </div>

                <div className="flex gap-2">
                  <Controller
                    name={`meta.${index}.should_convert_attachment`}
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
                          id: `${index}.should_convert_attachment`,
                          checked: value,
                          ...field,
                        }}
                      />
                    )}
                  />

                  <label
                    htmlFor={`${index}.should_convert_attachment`}
                    className="crm-label inline after:contents"
                  >
                    Convert Attachments
                  </label>
                </div>
              </div>

              <PropertyMapping ref={ref} index={index} item={item} />
            </div>
          ))}
        </form>
      </FormProvider>

      <div className="mt-8 gap-2 flex items-center justify-end">
        <button onClick={submitModule} className="crm-button">
          <span className="fa fa-check mr-2" />
          Submit
        </button>

        <button onClick={close} className="crm-button-outline">
          <span className="fa fa-times mr-2" />
          Cancel
        </button>
      </div>
    </Modal>
  )
}
