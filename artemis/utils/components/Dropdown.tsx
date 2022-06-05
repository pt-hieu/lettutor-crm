import { AnimatePresence, motion } from 'framer-motion'
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import useClickAway from 'react-use/lib/useClickAway'
import useHoverDirty from 'react-use/lib/useHoverDirty'

import { useModal } from '../hooks/useModal'

type Props = {
  children: ReactNode
  overlay: ReactNode
  triggerOnHover?: boolean
  triggerOnClick?: boolean
  className?: string
  onVisibilityChange?: (v: boolean) => void

  /** @default true */
  destroyOnHide?: boolean

  /** @default false */
  stopPropagation?: boolean
}

export default function Dropdown({
  children,
  overlay,
  triggerOnClick,
  triggerOnHover,
  className,
  destroyOnHide = true,
  stopPropagation = false,
  onVisibilityChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const isContainerHover = useHoverDirty(containerRef)

  const [popup, _, closeModal, toggleModal] = useModal()

  useEffect(() => {
    onVisibilityChange?.(popup)
  }, [popup])

  useLayoutEffect(() => {
    if (destroyOnHide) return
    if (!popupRef.current) return

    if (!popup) {
      popupRef.current.style.transform = 'translateX(-1000000000000px)'
    }

    if (popup) {
      popupRef.current.style.transform = 'translateX(0px)'
    }
  }, [popup, destroyOnHide])

  useLayoutEffect(() => {
    if (!popupRef.current) return
    if (!popup) return

    let top = '',
      left = '',
      transform = ''
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
    )
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    )
    const { top: eTop, left: eLeft } = popupRef.current.getBoundingClientRect()
    const isFirstQuater = eTop < vh / 2 && eLeft < vw / 2
    const isSecondQuater = eTop < vh / 2 && eLeft >= vw / 2
    const isThirdQuater = eTop >= vh / 2 && eLeft < vw / 2
    const isFourthQuater = eTop >= vh / 2 && eLeft >= vw / 2

    if (isFirstQuater) {
      top = `calc(100%)`
    }

    if (isSecondQuater) {
      top = `calc(100%)`
      left = `calc(100%)`
      transform = `translateX(-100%)`
    }

    if (isThirdQuater) {
      top = '-4px'
      transform = `translate(0, -100%)`
    }

    if (isFourthQuater) {
      left = '100%'
      top = '-4px'
      transform = `translate(-100%, -100%)`
    }

    popupRef.current.style.top = top
    popupRef.current.style.left = left
    popupRef.current.style.transform = transform
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
    containerRef,
    useCallback(() => {
      closeModal()
    }, []),
    ['touchdown', 'mousedown'],
  )

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onClick={openPopup}
      role="button"
    >
      {children}

      <AnimatePresence exitBeforeEnter>
        {(popup || !destroyOnHide) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'linear', duration: 0.1 }}
            className={`absolute z-[10001]`}
            ref={popupRef}
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
