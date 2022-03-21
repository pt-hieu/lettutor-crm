import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from 'react-query'

import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import { getTask } from '@utils/service/task'

const TaskDetailSidebar = () => {
  const client = useQueryClient()
  const { query } = useRouter()

  const taskId = query.id as string
  const { data: task } = useQuery(['task', taskId], getTask(taskId), {
    enabled: false,
  })

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: 'Notes',
        },
        {
          label: 'Logs',
        },
        {
          id: 'Attachments',
          label: (
            <span>
              Attachments
              {!!task?.attachments.length && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {task.attachments.length}
                </span>
              )}
            </span>
          ),
          extend: {
            title: 'Add attachments',
            onClick: () =>
              client.setQueryData('cmd:add-attachment', Date.now()),
          },
        },
      ],
    },
  ]
  return (
    <div className="relative">
      <DetailPageSidebar data={SideBarItems} />
    </div>
  )
}

export default TaskDetailSidebar
