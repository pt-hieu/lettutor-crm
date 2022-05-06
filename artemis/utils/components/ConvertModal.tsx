import { Divider, Modal, Switch, notification } from 'antd'
import { SwitchChangeEventHandler } from 'antd/lib/switch'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'

import Field from '@components/Module/Field'

import { useRelationField } from '@utils/hooks/useRelationField'
import { Entity, Module } from '@utils/models/module'
import { convert } from '@utils/service/module'

import Loading from './Loading'

type Props = {
  visible: boolean
  close: () => void
  moduleName: string
  sourceId: string
}

export default function ConvertModal({
  close,
  visible,
  moduleName,
  sourceId,
}: Props) {
  const { asPath } = useRouter()
  const { data: modules } = useQuery<Module[]>(
    ['convertable_modules', moduleName],
    { enabled: false },
  )

  useEffect(() => {
    close()
  }, [asPath])

  const [convertResults, setConvertResult] = useState<Entity[]>()

  const form = useForm<{ module_name: string; dto: any }[]>({
    shouldUnregister: true,
  })

  const [moduleFlags, setModuldeFlags] = useState<Record<string, boolean>>(
    modules?.reduce((res, module) => ({ ...res, [module.name]: false }), {}) ||
      {},
  )

  const handleToggleModule = useCallback<
    (name: string) => NonNullable<ComponentProps<typeof Switch>['onChange']>
  >(
    (name) => (e) => {
      moduleFlags[name] = e
      setModuldeFlags({ ...moduleFlags })
    },
    [moduleFlags],
  )

  useEffect(() => {
    if (!visible) return
    setModuldeFlags(
      modules?.reduce(
        (res, module) => ({ ...res, [module.name]: false }),
        {},
      ) || [],
    )
  }, [visible])

  const { mutateAsync, isLoading } = useMutation(
    ['convert_entities', sourceId],
    convert(sourceId),
    {
      onError() {
        notification.error({ message: 'Convert unsuccesfully' })
      },
      onSuccess(e) {
        setConvertResult(e)
        notification.success({ message: 'Convert succesfully' })
      },
    },
  )

  const handleSubmitConvert = useCallback(
    form.handleSubmit(
      (data) => {
        mutateAsync(Object.values(data).filter((item) => !!item.dto))
      },
      (e) => console.log(e),
    ),
    [],
  )

  return (
    <Modal
      visible={visible}
      onCancel={convertResults ? undefined : close}
      centered
      footer={null}
    >
      <div className="font-medium text-xl">
        {convertResults ? 'Converted Succesfully' : 'Convert To'}
      </div>

      <Divider />

      {!convertResults && (
        <form onSubmit={handleSubmitConvert} className="flex flex-col gap-4">
          <FormProvider {...form}>
            {modules?.map((module, index) => (
              <ConvertForm
                sourceModuleName={moduleName}
                key={module.id}
                module={module}
                onModuleToggle={handleToggleModule}
                isModuleTargeted={moduleFlags[module.name]}
                index={index}
              />
            ))}
          </FormProvider>
        </form>
      )}

      {convertResults && (
        <div className="flex flex-col gap-4 mb-8">
          {convertResults.map((e) => (
            <div key={e.id}>
              <span className="fa fa-arrow-right mr-2" />
              <span className="px-3 py-2 bg-gray-300 rounded-md font-medium">
                <Link
                  href={{
                    pathname: '/[...path]',
                    query: { path: [e.module.name, e.id] },
                  }}
                  replace
                >
                  <a className="hover:text-current">{e.name}</a>
                </Link>
              </span>
            </div>
          ))}
        </div>
      )}

      {!convertResults && (
        <div className="mt-4 flex gap-2 justify-end items-center">
          <button onClick={close} className="crm-button-outline">
            Cancel
          </button>

          <button
            disabled={isLoading}
            onClick={handleSubmitConvert}
            className="crm-button"
          >
            <Loading on={isLoading}>Submit</Loading>
          </button>
        </div>
      )}
    </Modal>
  )
}

type ConvertFormProps = {
  module: Module
  onModuleToggle: (name: string) => SwitchChangeEventHandler
  isModuleTargeted: boolean
  sourceModuleName: string
  index: number
}

function ConvertForm({
  module,
  sourceModuleName,
  onModuleToggle: toggleModule,
  isModuleTargeted,
  index,
}: ConvertFormProps) {
  const { setValue } = useFormContext<{ module_name?: string; dto: any }[]>()
  useRelationField(module.meta)

  const convertMeta = useMemo(
    () =>
      module.convert_meta.find(({ source }) => source === sourceModuleName)!,
    [],
  )
  const missingFields = useMemo(
    () =>
      module.meta?.filter(
        (field) =>
          !Object.keys(convertMeta.meta).some((prop) => prop === field.name),
      ) || [],
    [module],
  )

  useEffect(() => {
    if (!isModuleTargeted) return
    setValue(`${index}.module_name`, module.name)
  }, [isModuleTargeted])

  return (
    <div key={module.id}>
      <div className="flex items-center justify-between mb-3 pb-3 border-b">
        <label className="capitalize font-medium" htmlFor={module.name}>
          {module.name}
        </label>

        <Switch onChange={toggleModule(module.name)} id={module.name} />
      </div>

      <AnimatePresence exitBeforeEnter presenceAffectsLayout>
        {isModuleTargeted && (
          <motion.div
            initial={{ height: 0, opacity: 0, padding: 0 }}
            animate={{ height: 'auto', opacity: 1, padding: 16 }}
            exit={{ height: 0, opacity: 0, padding: 0 }}
            className="overflow-auto max-h-[200px] flex flex-col gap-2 border border-dashed "
            transition={{ ease: 'linear', duration: 0.15 }}
          >
            {missingFields
              .filter((field) => !!field.visibility.Create && field.required)
              .map((field) => (
                <Field
                  key={field.name}
                  data={field}
                  registerName={`${index}.dto.${field.name}`}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
