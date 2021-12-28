import Animate from './Animate'
import Link from 'next/link'
import { SettingData } from '@utils/data/setting-data'
import useGlobalDate from '@utils/hooks/useGlobalDate'
import { useEffect } from 'react'

type Props = {
  visible: boolean
  setVisible: (v: boolean) => void
}

export default function SettingMenu({ visible, setVisible }: Props) {
  const { effect } = useGlobalDate({
    callback: () => {
      setVisible(false)
    },
  })

  useEffect(() => {
    if (!visible) return
    effect()
  }, [visible])

  return (
    <Animate
      shouldAnimateOnExit
      presenceProps={{ exitBeforeEnter: true }}
      on={visible}
      transition={{ duration: 0.3 }}
      animation={{
        start: { opacity: 0 },
        animate: { opacity: 1 },
        end: { opacity: 0 },
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="min-w-[500px] min-h-[150px] border rounded-md shadow-md bg-white absolute top-[150%] transform translate-x-[-95%] p-4 text-gray-500"
      >
        <Link href="/settings">
          <a className="crm-link font-semibold text-[17px] block border-b pb-2 mb-2">
            Settings
          </a>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          {SettingData.map(({ title, items }) => (
            <div key={title}>
              <div className="text-black font-medium">{title}</div>
              <div className="flex flex-col mt-2">
                {items.map((item) => (
                  <Link href={item.link} key={item.link}>
                    <a className="crm-link text-gray-700">{item.title}</a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Animate>
  )
}
