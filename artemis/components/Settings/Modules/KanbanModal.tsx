import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal } from 'antd'
import { tuple } from 'antd/lib/_util/type'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import { useDispatch } from '@utils/hooks/useDispatch'
import {
  AggregateType,
  FieldType,
  KanbanMeta,
  Module,
  RelateType,
} from '@utils/models/module'

type Props = {
  visible: boolean
  close: () => void
  module: Module | undefined
}

const schema = yup.object().shape(
  {
    field: yup.string().typeError('Field has to be a string'),
    aggregate_type: yup.string().when('aggregate_field', {
      is: (v: string) => !!v,
      then: yup
        .string()
        .oneOf(Object.values(AggregateType), 'Invalid type')
        .required('Aggregate type is required'),
      otherwise: yup.string(),
    }),
    aggregate_field: yup.string().when('aggregate_type', {
      is: (v: string) => !!v,
      then: yup.string().required('Aggregrate field is required'),
      otherwise: yup.string(),
    }),
  },
  // @ts-ignore
  ['aggregate_type', 'aggregate_field'],
)

export default function KanbanModal({ close, visible, module }: Props) {
  const { control, watch, reset, handleSubmit } = useForm<KanbanMeta>({
    shouldUnregister: true,
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (!visible) return
    reset(module?.kanban_meta || {})
  }, [visible])

  const field = watch('field')
  const dispatch = useDispatch()

  const submit = useCallback(
    handleSubmit((data) => {
      close()
      dispatch('cmd:update-kanban-setting', data)
    }),
    [],
  )

  return (
    <Modal visible={visible} onCancel={close} centered footer={false}>
      <div className="font-medium text-xl">Kanban Setting</div>
      <Divider />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="crm-label" htmlFor="field">
            Field
          </label>

          <Controller
            control={control}
            name="field"
            render={({ field, fieldState: { error } }) => (
              <Input
                error={error?.message}
                as="select"
                props={{
                  ...field,
                  className: 'w-full',
                  id: 'field',
                  children: (
                    <>
                      <option value="">Turn off Kanban</option>
                      {module?.meta
                        ?.filter(
                          (field) =>
                            field.type === FieldType.SELECT ||
                            (field.type === FieldType.RELATION &&
                              field.relateType === RelateType.SINGLE),
                        )
                        .map((field) => (
                          <option value={field.name}>{field.name}</option>
                        ))}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>

        <AnimatePresence presenceAffectsLayout exitBeforeEnter>
          {field && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ease: 'linear', duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mb-2">Aggregation</div>
              <div className="p-4 border border-dashed rounded-md">
                <div>
                  <label
                    className="crm-label after:contents"
                    htmlFor="aggregate_type"
                  >
                    Type
                  </label>

                  <Controller
                    control={control}
                    name="aggregate_type"
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        error={error?.message}
                        as="select"
                        props={{
                          ...field,
                          className: 'w-full',
                          id: 'aggregate_type',
                          children: (
                            <>
                              <option value="">
                                Select Type of Aggregation
                              </option>
                              {Object.values(AggregateType).map((type) => (
                                <option value={type}>{type}</option>
                              ))}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </div>

                <div className="mt-4">
                  <label
                    className="crm-label after:contents"
                    htmlFor="aggregate_field"
                  >
                    Field
                  </label>

                  <Controller
                    control={control}
                    name="aggregate_field"
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        error={error?.message}
                        as="select"
                        props={{
                          ...field,
                          className: 'w-full',
                          id: 'aggregate_field',
                          children: (
                            <>
                              <option value="">
                                Select Field of Aggregation
                              </option>
                              {module?.meta
                                ?.filter(
                                  (field) => field.type === FieldType.NUMBER,
                                )
                                .map((field) => (
                                  <option value={field.name}>
                                    {field.name}
                                  </option>
                                ))}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-4 flex gap-2 justify-end">
        <button onClick={submit} className="crm-button">
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
