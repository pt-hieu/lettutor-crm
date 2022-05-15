import { AnimatePresence, motion } from 'framer-motion'
import { MouseEvent, ReactNode, useCallback, useEffect, useRef } from 'react'
import { useClickAway, useHoverDirty } from 'react-use'

import { useModal } from '@utils/hooks/useModal'

type Props = {
  children: ReactNode
  overlay: ReactNode
  triggerOnHover?: boolean
  triggerOnClick?: boolean
  className?: string
  onVisibilityChange?: (v: boolean) => void
}

export default function Dropdown({
  children,
  overlay,
  triggerOnClick,
  triggerOnHover,
  className,
  onVisibilityChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isContainerHover = useHoverDirty(ref)

  const [popup, _, closeModal, toggleModal] = useModal()

  useEffect(() => {
    onVisibilityChange && onVisibilityChange(popup)
  }, [popup])

  const openPopup = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!(triggerOnClick ?? true)) return
      toggleModal()

      e.stopPropagation()
    },
    [triggerOnClick],
  )

  useEffect(() => {
    if (!(triggerOnHover ?? true)) return
    toggleModal()
  }, [isContainerHover])

  useClickAway(
    ref,
    useCallback(() => {
      closeModal()
    }, []),
  )

  return (
    <div ref={ref} className={`relative ${className}`} onClick={openPopup}>
      {children}

      <AnimatePresence exitBeforeEnter>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'linear', duration: 0.1 }}
            className="absolute right-0 bottom-[-10%] translate-y-full z-[10001]"
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
