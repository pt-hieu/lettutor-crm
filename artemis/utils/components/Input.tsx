import {
  DetailedHTMLProps,
  InputHTMLAttributes,
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

export type Props<T> = NativeProps<T> & {
  editable?: boolean
  wrapperClassname?: string
  wrapperOnClick?: () => any
} & (
    | { showError?: true; error: string | undefined }
    | { showError: false; error?: never }
  )

const variants = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

function Input<T extends 'input' | 'select' | 'textarea' | undefined>(
  {
    error,
    wrapperOnClick,
    as,
    showError,
    wrapperClassname,
    editable,
    props: { className, disabled, ...rest },
  }: Props<T>,
  _ref: any,
) {
  const Component = as || 'input'

  return (
    <div onClick={wrapperOnClick} className={wrapperClassname}>
      {/* @ts-ignore */}
      <Component
        className={
          `crm-input ${
            (editable === undefined || editable === true) && disabled
              ? 'bg-gray-300 '
              : ' '
          } ${error ? 'crm-input--invalid ' : ''}` +
          (className || '') +
          (editable !== undefined
            ? editable
              ? ''
              : ' !ring-0 text-black'
            : '')
        }
        disabled={disabled ?? editable === false}
        {...rest}
      />
      <AnimatePresence presenceAffectsLayout>
        {(showError ?? true) && error && (
          <motion.div
            initial="init"
            animate="animating"
            exit="init"
            variants={variants}
            className="text-red-600 overflow-hidden pl-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default forwardRef(Input)
