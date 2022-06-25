import { notification } from 'antd'
import { capitalize } from 'lodash'
import NotFound from 'pages/404'
import { useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'

import { DetailNavbar } from '@components/Details/Navbar'
import { DetailSidebar, Sections } from '@components/Details/Sidebar'
import LogSection from '@components/Logs/LogSection'
import { NoteSection } from '@components/Notes/NoteSection'

import AttachmentSection from '@utils/components/AttachmentSection'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useRelationField } from '@utils/hooks/useRelationField'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { FieldType } from '@utils/models/module'
import { ActionType } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { getEntity, updateEntity } from '@utils/service/module'
import { getTaskOfEntity } from '@utils/service/task'

import Field from './Field'
import { toCapitalizedWords } from './OverviewView'

type TProps = {
  paths: string[]
}

export default function DetailView({ paths }: TProps) {
  const [moduleName, id] = paths
  const [session] = useTypedSession()
  const ownerId = session?.user.id
  const auth = useAuthorization()

  const { data, refetch } = useQuery(
    [moduleName, id],
    getEntity(moduleName, id),
    {
      enabled: false,
      keepPreviousData: true,
    },
  )

  const entity = data!
  const entityData = entity.data
  const metaData = entity.module.meta || []
  const isOwner = entityData.ownerId === ownerId

  useRelationField(entity.module.meta)

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      name: entity?.name,
      ...entityData,
    },
  })

  const { mutateAsync } = useMutation(
    [moduleName, id, 'updated'],
    updateEntity(moduleName, id),
    {
      onSuccess() {
        refetch()
        notification.success({
          message: `Update ${toCapitalizedWords(moduleName)} successfully`,
        })
      },
      onError() {
        notification.error({
          message: `Update ${toCapitalizedWords(
            moduleName,
          ).toLocaleLowerCase()} successfully`,
        })
      },
    },
  )

  const submitEntity = useCallback(
    form.handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  const { data: tasks, refetch: refetchTasks } = useQuery(
    [moduleName, id, 'tasks'],
    getTaskOfEntity(id),
    { enabled: false },
  )

  const { open: openTasks, close: closedTasks } = useMemo(
    () => ({
      open: tasks?.filter((task) => task.status !== TaskStatus.COMPLETED),
      close: tasks?.filter((task) => task.status === TaskStatus.COMPLETED),
    }),
    [tasks],
  )

  if (!auth(ActionType.CAN_VIEW_DETAIL_ANY, moduleName) && !isOwner) {
    return <NotFound />
  }

  return (
    <Layout title={`CRM | ${capitalize(moduleName)} | ${entity?.name}`}>
      <div className="crm-container">
        <DetailNavbar data={entity} />

        <div className="grid grid-cols-[250px,1fr] gap-5">
          <DetailSidebar paths={paths} />

          <div className="flex flex-col gap-4">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>

              <form
                onSubmit={submitEntity}
                className="flex flex-col"
                key={JSON.stringify({
                  name: entity?.name,
                  ...entityData,
                })}
              >
                <FormProvider {...form}>
                  <Field
                    data={{
                      group: '',
                      name: 'name',
                      required: true,
                      type: FieldType.TEXT,
                      visibility: { Overview: true, Update: true },
                      maxLength: 30,
                    }}
                    inlineEdit
                    hideControl={
                      !auth(ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY, moduleName)
                    }
                  />

                  {metaData
                    .filter((field) => !!field.visibility.Detail)
                    .map((field) => (
                      <Field
                        data={field}
                        key={field.name}
                        inlineEdit
                        hideControl={
                          !auth(
                            ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
                            moduleName,
                          )
                        }
                      />
                    ))}
                </FormProvider>
              </form>
            </div>

            <NoteSection
              id={Sections.Notes}
              moduleName={moduleName}
              entityId={entity.id}
              hasFilter={moduleName === 'account'}
            />

            <div className="p-4 rounded-md border">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={Sections.OpenActivities}
              >
                {Sections.OpenActivities}
              </div>

              {openTasks && openTasks.length > 0 ? (
                <TaskList
                  onCloseTask={() => refetchTasks()}
                  tasks={openTasks}
                />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>

            <div className="p-4 rounded-md border">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={Sections.ClosedActivities}
              >
                {Sections.ClosedActivities}
              </div>

              {closedTasks && closedTasks.length > 0 ? (
                <TaskList
                  onCloseTask={() => refetchTasks()}
                  tasks={closedTasks}
                />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>

            <AttachmentSection
              moduleName={moduleName}
              entityId={id}
              id={Sections.Attachments}
              data={entity.attachments}
            />

            <LogSection title="Logs" source={moduleName} entityId={id} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
