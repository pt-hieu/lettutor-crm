import { useModal } from '@utils/hooks/useModal'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ReactNode,
  useCallback,
  useRef,
  MouseEvent,
  useEffect,
} from 'react'
import { useHoverDirty, useClickAway } from 'react-use'

type Props = {
  children: ReactNode
  overlay: ReactNode
  triggerOnHover?: boolean
  triggerOnClick?: boolean
}

export default function Dropdown({
  children,
  overlay,
  triggerOnClick,
  triggerOnHover,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isContainerHover = useHoverDirty(ref)

  const [popup, _, closeModal, toggleModal] = useModal()

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
    <div ref={ref} className="relative" onClick={openPopup}>
      <div >{children}</div>

      <AnimatePresence exitBeforeEnter>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'linear', duration: 0.1 }}
            className="absolute right-0 bottom-[-10%] translate-y-full"
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
