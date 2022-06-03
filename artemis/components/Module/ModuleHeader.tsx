import { Divider, Modal, Switch, notification } from 'antd'
import { capitalize } from 'lodash'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import File from '@components/Notes/File'

import ButtonAdd from '@utils/components/ButtonAdd'
import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useCommand } from '@utils/hooks/useCommand'
import { useModal } from '@utils/hooks/useModal'
import { Module } from '@utils/models/module'
import { ActionType, DefaultModule } from '@utils/models/role'
import {
  batchDeleteEntities,
  downloadTemplate,
  exportModuleEntities,
  importModule,
} from '@utils/service/module'

import { MODE } from './OverviewView'

type Props = {
  module: Module
  onSearchChange?: (v: string) => void
  search?: string
  onModeChange: (mode: MODE) => void
  mode: MODE
}

export default function ModuleHeader({
  module,
  onSearchChange,
  search,
  onModeChange: changeMode,
  mode,
}: Props) {
  const client = useQueryClient()
  const auth = useAuthorization()
  const { data: ids } = useQuery<string[]>(['selected-ids', module.name], {
    enabled: false,
  })

  const [importModalVisible, openImportModal, closeImportModal] = useModal()

  const { register, handleSubmit, setValue } = useForm<{ search?: string }>({
    defaultValues: { search },
    shouldUnregister: true,
  })

  useEffect(() => {
    setValue('search', search)
  }, [search])

  const submitSearch = useCallback(
    handleSubmit(({ search }) => {
      if (!onSearchChange) return
      onSearchChange(search!)
    }),
    [],
  )

  const { mutateAsync, isLoading } = useMutation(
    ['deleted-entities', module.name],
    batchDeleteEntities,
    {
      onSuccess() {
        client.setQueryData(['selected-ids', module.name], [])
        notification.success({ message: `Delete ${module.name} succesfully` })
      },
      onError() {
        notification.error({ message: `Delete ${module.name} unsuccesfully` })
      },
      onSettled() {
        client.refetchQueries(module.name)
      },
    },
  )

  return (
    <div className="flex justify-between items-center p-1">
      <form onSubmit={submitSearch} className="flex">
        <Input
          showError={false}
          props={{
            type: 'text',
            placeholder: 'Search',
            ...register('search'),
          }}
        />

        <button className="crm-button ml-4 px-4">
          <span className="fa fa-search" />
        </button>
      </form>

      <div className="flex gap-2 items-center">
        {module.kanban_meta && (
          <Switch
            checked={mode === MODE.KANBAN}
            onChange={(v) => changeMode(v ? MODE.KANBAN : MODE.DEFAULT)}
          />
        )}

        {!!ids?.length && (
          <Confirm
            onYes={() => mutateAsync(ids)}
            message={`Are you sure you want to delete ${ids.length} selected ${module.name}?`}
          >
            <button disabled={isLoading} className="crm-button-danger">
              <span className="fa fa-trash mr-2" /> Delete
            </button>
          </Confirm>
        )}

        {auth(ActionType.CAN_CREATE_NEW, module.name) && (
          <ButtonAdd
            title={`Create ${capitalize(module.name)}`}
            asLink
            link={`/${module.name}/create`}
          />
        )}

        {module.name === DefaultModule.LEAD && (
          <>
            <button onClick={openImportModal} className="crm-button">
              Import Lead
            </button>

            <button
              onClick={downloadTemplate(DefaultModule.LEAD)}
              className="crm-button-secondary"
            >
              Download CSV Template
            </button>

            <button
              onClick={exportModuleEntities(DefaultModule.LEAD)}
              className="crm-button-secondary"
            >
              Export
            </button>
          </>
        )}

        <ImportLeadModal
          moduleName={module.name}
          visible={importModalVisible}
          close={closeImportModal}
        />
      </div>
    </div>
  )
}

type TModalProps = {
  moduleName: string
  visible: boolean
  close: () => void
}

const ImportLeadModal = ({ moduleName, visible, close }: TModalProps) => {
  const client = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)

  const openInput = useCallback(() => {
    if (!inputRef.current) return
    inputRef.current.click()
  }, [])

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    console.log(selectedFiles)
    event.target.value = ''
    setFile(selectedFiles[0])
  }

  const removeFile = useCallback(() => {
    setFile(null)
  }, [])

  const closeAndClearFiles = () => {
    removeFile()
    close()
  }

  const { mutateAsync: importModuleEntity } = useMutation(
    `import-${moduleName}`,
    importModule(moduleName),
    {
      onSuccess: () => {
        client.invalidateQueries([moduleName])
        notification.success({
          message: `Import ${moduleName} successfully.`,
        })
        closeAndClearFiles()
      },
      onError: () => {
        notification.error({
          message: `Import ${moduleName} unsuccessfully.`,
        })
        closeAndClearFiles()
      },
    },
  )

  return (
    <Modal
      centered
      onCancel={closeAndClearFiles}
      visible={visible}
      footer={null}
    >
      <div className="font-medium text-xl">{`Import ${moduleName}`}</div>

      <Divider />

      <div className="w-full">
        <div>
          <input
            ref={inputRef}
            multiple
            onChange={handleSelectFile}
            type="file"
            hidden
          />
          <div
            onClick={file ? undefined : openInput}
            className={` ${'min-h-[200px] border-dashed cursor-pointer grid place-content-center border rounded-md'} `}
          >
            {!file && (
              <div className="font-semibold text-gray-400/30 text-xl">
                Browse files
              </div>
            )}

            {file && (
              <File
                key={file.name}
                filename={file.name}
                onRemove={removeFile}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 self-end">
        <button onClick={closeAndClearFiles} className="crm-button-outline">
          Cancel
        </button>
        <button
          onClick={() => importModuleEntity(file as File)}
          className="crm-button"
          disabled={!file}
        >
          <span className="fa fa-upload mr-2" />
          Import
        </button>
      </div>
    </Modal>
  )
}
