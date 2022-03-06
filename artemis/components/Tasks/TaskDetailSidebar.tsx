import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'

const TaskDetailSidebar = () => {
  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: "Logs",
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
