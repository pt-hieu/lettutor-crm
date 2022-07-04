import Link from 'next/link'

import { SettingData } from '@utils/data/setting-data'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { ActionType } from '@utils/models/role'

export default function SettingMenu() {
  const auth = useAuthorization()

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="min-w-[500px] min-h-[150px] border rounded-md shadow-md bg-white p-4 text-gray-500"
    >
      <Link href="/settings">
        <a className="crm-link font-semibold text-[17px] block border-b pb-2 mb-2">
          Settings
          <span className="ml-2 text-sm fa-solid fa-arrow-up-right-from-square" />
        </a>
      </Link>
      <div className="grid grid-cols-2 gap-3">
        {SettingData.map(({ title, items }) => (
          <div key={title}>
            <div className="text-black font-medium">{title}</div>
            <div className="flex flex-col mt-2">
              {items.map((item) =>
                item.isPrivate &&
                !(
                  auth(ActionType.CAN_VIEW_ALL, item.target) ||
                  auth(ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY, item.target) ||
                  auth(ActionType.IS_ADMIN)
                ) ? (
                  <span className="text-gray-60 cursor-not-allowed">
                    {item.title}
                  </span>
                ) : (
                  <Link href={item.link} key={item.link}>
                    <a className="crm-link text-gray-700">{item.title}</a>
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
