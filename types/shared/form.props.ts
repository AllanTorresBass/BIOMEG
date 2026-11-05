import type { ReactElement, ReactNode } from 'react'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'

export type FormFieldProps<Values extends FieldValues, Name extends FieldPath<Values>> = ControllerProps<Values, Name>

export interface FormItemContextValue {
  id: string
}

export interface FormItemProps {
  className?: string
  children: ReactNode
}

export interface FormLabelProps {
  className?: string
  children: ReactNode
}

export interface FormControlProps {
  children: ReactElement<Record<string, unknown>>
  /** An error shown elsewhere, such as one the server returned for this field. */
  describedBy?: string | undefined
}
