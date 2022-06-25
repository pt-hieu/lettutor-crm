import { Divider, Modal } from 'antd'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { QueryKey, useQueryClient } from 'react-query'

import Field from '@components/Module/Field'

import { Entity, FieldMeta } from '@utils/models/module'
import { updateEntity } from '@utils/service/module'

type Props = {
  visible: boolean
  close: () => void
  fields: FieldMeta[]
  moduleName: string
  entityId: string
  dataKey: QueryKey
  entity: Entity | undefined
}

export default function ConfirmStageModal({
  close,
  visible,
  fields,
  entityId,
  moduleName,
  dataKey,
  entity,
}: Props) {
  const form = useForm()
  const client = useQueryClient()

  useEffect(() => {
    if (!visible) return
    form.reset({
      name: entity?.name,
      ...entity?.data,
    })
  }, [visible, entity])

  const submit = useCallback(
    form.handleSubmit(async (data) => {
      console.log(data)

      await updateEntity(moduleName, entityId)(data)

      client.refetchQueries(dataKey)
      close()
    }),
    [entityId, moduleName, dataKey],
  )

  return (
    <Modal
      destroyOnClose
      visible={visible}
      onCancel={close}
      footer={null}
      centered
    >
      <div className="font-semibold text-xl">Confirm Stage</div>
      <Divider />

      <form onSubmit={submit} className="flex flex-col">
        <FormProvider {...form}>
          {fields.map((field) => (
            <Field data={field} key={field.name} />
          ))}
        </FormProvider>
      </form>

      <Divider />
      <div className="flex items-center justify-end gap-2">
        <button onClick={close} className="crm-button-outline">
          Cancel
        </button>

        <button onClick={submit} className="crm-button">
          Submit
        </button>
      </div>
    </Modal>
  )
}
