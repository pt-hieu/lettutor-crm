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

type NativeProps<T> = T extends undefined
  ? {
      as?: T
      props: InputProps
    }
  : T extends 'input'
  ? {
      as: T
      props: InputProps
    }
  : T extends 'select'
  ? {
      as: T
      props: SelectProps
    }
  : T extends 'textarea'
  ? {
      as: T
      props: TextAreaProps
    }
  : {}

type Props<T> = NativeProps<T> & {
  error: string | undefined
  showError?: boolean
  id?: never
  onInvalid?: never
}

const variants = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

function Input<T extends 'input' | 'select' | 'textarea' | undefined>(
  { error, as, showError, props: { name, className, ...rest } }: Props<T>,
  _ref: any,
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
}

export default forwardRef(Input)
