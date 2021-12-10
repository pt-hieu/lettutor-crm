type Data = {
  label: string
  link?: string
}

const SideBarItem: Data[] = [
  { label: 'Deals' },
  { label: 'Open Activities' },
  { label: 'Closed Activities' },
]

const ContactDetailSidebar = () => {
  return (
    <div>
      <div className="px-2 font-semibold text-[17px] mb-3">Related Lists</div>
      <ul className="flex flex-col gap-2 pr-4">
        {SideBarItem.map(({ label }) => (
          <li
            className="p-2 text-sm rounded-md hover:bg-gray-100 hover:cursor-pointer"
            key={label}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ContactDetailSidebar
