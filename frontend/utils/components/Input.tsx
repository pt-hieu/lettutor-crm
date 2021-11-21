import {
  DetailedHTMLProps,
  FormEvent,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'onInvalid' | 'id'
  > {
  error: string | undefined
}

const variants = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export default forwardRef<HTMLInputElement, Props>(function Input(
  { error, name, className, ...rest },
  ref,
) {
  const ele = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!ele.current) {
      ele.current = document.querySelector('#' + name)
    }

    if (!ele.current) return
    ele.current.setCustomValidity(error || '')
  }, [error])

  const removeBubble = useCallback((e: FormEvent<HTMLInputElement>) => {
    e.preventDefault()
  }, [])

  return (
    <>
      <input
        {...rest}
        ref={ref}
        className={'crm-input ' + className}
        onInvalid={removeBubble}
        name={name}
        id={name}
      />
      <AnimatePresence presenceAffectsLayout>
        {error && (
          <motion.div
            initial="init"
            animate="animating"
            exit="init"
            variants={variants}
            className="text-red-600 overflow-hidden"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})
