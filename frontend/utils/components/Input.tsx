import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

type SelectProps = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>

type TextAreaProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>

type Props = (
  | { as?: 'input'; props: InputProps }
  | { as: 'select'; props: SelectProps }
  | { as: 'textarea'; props: TextAreaProps }
) & {
  error: string | undefined
  showError?: boolean
}

const variants = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export default forwardRef<any, Omit<Props, 'id' | 'onInvalid'>>(function Input(
  { error, as, showError, props: { name, className, ...rest } },
  _ref,
) {
  const ele = useRef<any | null>(null)

  useEffect(() => {
    if (!ele.current) {
      ele.current = document.querySelector('#' + name)
    }

    ele.current?.setCustomValidity(error || '')
  }, [error])

  const removeBubble = useCallback((e: any) => {
    e.preventDefault()
  }, [])

  const Component = as || 'input'

  return (
    <>
      {/* @ts-ignore */}
      <Component
        // @ts-ignore
        onInvalid={removeBubble}
        className={'crm-input ' + className}
        name={name}
        id={name}
        {...rest}
      />
      <AnimatePresence presenceAffectsLayout>
        {(showError ?? true) && error && (
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
