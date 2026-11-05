'use client'

import { cloneElement, createContext, useContext, useId } from 'react'
import { Controller, FormProvider, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils/cn'
import type { FormControlProps, FormFieldProps, FormItemContextValue, FormItemProps, FormLabelProps } from '@/types/shared/form.props'

/** The shadcn form API on react-hook-form, with no Radix dependency. Styled from the BIOMEG tokens. */
export const Form = FormProvider

const FieldNameContext = createContext<string>('')
const ItemContext = createContext<FormItemContextValue>({ id: '' })

export function FormField<Values extends FieldValues, Name extends FieldPath<Values>>(props: FormFieldProps<Values, Name>) {
  return (
    <FieldNameContext.Provider value={props.name}>
      <Controller {...props} />
    </FieldNameContext.Provider>
  )
}

function useFieldError() {
  const name = useContext(FieldNameContext)
  const { id } = useContext(ItemContext)
  const { getFieldState, formState } = useFormContext()
  const { error } = getFieldState(name, formState)
  return { id, error }
}

export function FormItem({ className, children }: FormItemProps) {
  const id = useId()
  return (
    <ItemContext.Provider value={{ id }}>
      <div className={cn('flex flex-col gap-1', className)}>{children}</div>
    </ItemContext.Provider>
  )
}

export function FormLabel({ className, children }: FormLabelProps) {
  const { id } = useFieldError()
  return (
    <label htmlFor={`${id}-control`} className={cn('font-semibold', className)}>
      {children}
    </label>
  )
}

export function FormControl({ children, describedBy }: FormControlProps) {
  const { id, error } = useFieldError()
  const described = [error ? `${id}-message` : null, describedBy].filter(Boolean).join(' ')
  return cloneElement(children, {
    id: `${id}-control`,
    'aria-invalid': error || describedBy ? true : undefined,
    'aria-describedby': described || undefined,
  })
}

export function FormMessage() {
  const { id, error } = useFieldError()
  if (!error?.message) return null
  return (
    <p id={`${id}-message`} className="text-sm text-flag-blocked">
      {String(error.message)}
    </p>
  )
}
