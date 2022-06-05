import { Divider } from 'antd'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'

import { Notification } from '@utils/models/notification'
import { getMany, toggleRead } from '@utils/service/notification'

export default function Notifications() {
  const { data: notis, refetch } = useQuery<Notification[]>(
    'notifications',
    getMany({ shouldNotPaginate: true }) as unknown as any,
    { enabled: false },
  )

  useEffect(() => {
    !notis && refetch()
  }, [])

  const { mutateAsync } = useMutation('toggle', toggleRead, {
    onSuccess: () => {
      refetch()
    },
  })

  return (
    <div className="min-w-[350px] min-h-[500px] bg-white border rounded-md p-4 shadow-md cursor-default">
      <div className="font-semibold text-[17px]">Notifications</div>
      <Divider className="mt-2 mb-3" />

      <div className="flex flex-col divide-y max-h-[calc(500px-41.5px)] overflow-y-auto">
        {notis?.map((noti) => (
          <div key={noti.id} className="p-3 px-0">
            {noti.read && (
              <button
                onClick={() => mutateAsync({ id: noti.id, value: false })}
                className="fa fa-envelope-open mr-2"
              />
            )}
            {!noti.read && (
              <button
                onClick={() => mutateAsync({ id: noti.id, value: true })}
                className="fa fa-envelope mr-2"
              />
            )}

            {noti.message}
          </div>
        ))}
      </div>
    </div>
  )
}
