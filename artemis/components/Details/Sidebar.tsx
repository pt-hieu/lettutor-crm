import React, { useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import AddTaskModal from '@utils/components/AddTaskModal'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import { useModal } from '@utils/hooks/useModal'
import { TaskStatus } from '@utils/models/task'
import { getTaskOfEntity } from '@utils/service/task'

type Props = {
  paths: string[]
}

export enum Sections {
  Notes = 'Notes',
  Deals = 'Deals',
  Logs = 'Logs',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
  Attachments = 'Attachments',
}

export const DetailSidebar = ({ paths }: Props) => {
  const [moduleName, id] = paths

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()

  const client = useQueryClient()

  const { data: tasks } = useQuery(
    [moduleName, id, 'tasks'],
    getTaskOfEntity(id),
    { enabled: false },
  )

  const { open, close } = useMemo(
    () => ({
      open: tasks?.filter((task) => task.status !== TaskStatus.COMPLETED)
        .length,
      close: tasks?.filter((task) => task.status === TaskStatus.COMPLETED)
        .length,
    }),
    [tasks],
  )

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: Sections.Notes,
        },
        {
          id: Sections.OpenActivities,
          label: (
            <span>
              {Sections.OpenActivities}
              {!!open && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {open}
                </span>
              )}
            </span>
          ),
          extend: {
            title: 'Add A Task',
            onClick: () => openCreateTask(),
          },
        },
        {
          id: Sections.ClosedActivities,
          label: (
            <span>
              {Sections.ClosedActivities}
              {!!close && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {close}
                </span>
              )}
            </span>
          ),
        },
        {
          id: Sections.Attachments,
          label: (
            <span>
              {Sections.Attachments}
              {/* {!!account?.attachments.length && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {account.attachments.length}
                </span>
              )} */}
            </span>
          ),
          extend: {
            title: 'Add attachments',
            onClick: () =>
              client.setQueryData('cmd:add-attachment', Date.now()),
          },
        },
        {
          label: Sections.Logs,
        },
      ],
    },
  ]

  return (
    <div className="relative">
      <AddTaskModal
        visible={createTaskVisible}
        handleClose={closeCreateTask}
        moduleName={moduleName}
        entityId={id}
      />
      <DetailPageSidebar data={SideBarItems} />
    </div>
  )
}
