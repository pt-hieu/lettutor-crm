import { SettingData } from '@utils/setting-data'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const variants = {
  notExpand: {
    height: 0,
    opacity: 0,
    marginTop: 0,
  },
  expand: {
    height: 'auto',
    opacity: 1,
    marginTop: 10,
  },
}

export default function Sidebar() {
  const { pathname } = useRouter()
  const [activeIndex, setActiveIndex] = useState<number>()

  const toggle = useCallback(
    (index: number) => () => {
      setActiveIndex((current) => (current === index ? undefined : index))
    },
    [],
  )

  return (
    <div className="h-full text-gray-700 bg-gray-100 flex flex-col gap-3 p-4 rounded-md">
      {SettingData.map(({ items, title }, index) => (
        <div key={title}>
          <button className="font-semibold" onClick={toggle(index)}>
            {title}
          </button>
          <AnimatePresence presenceAffectsLayout>
            {index === activeIndex && (
              <motion.div
                initial="notExpand"
                animate="expand"
                exit="notExpand"
                variants={variants}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {items.map(({ link, title: itemTitle }) => (
                  <Link key={itemTitle} href={link}>
                    <a
                      className={`pl-8 crm-link ${
                        pathname === link
                          ? 'text-blue-600 before:bg-blue-600'
                          : 'before:bg-gray-700'
                      } relative before:content before:absolute before:left-4 hover:before:bg-blue-600 before:crm-transition before:w-[3px] before:h-full`}
                    >
                      {itemTitle}
                    </a>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}