import { useQueryClient } from 'react-query'

import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'

const TaskDetailSidebar = () => {
  const client = useQueryClient()
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
          label: 'Attachments',
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
