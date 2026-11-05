'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { UnsavedEditsValue } from '@/types/shell/unsaved-edits-context.props'

const UnsavedEditsContext = createContext<UnsavedEditsValue | null>(null)

/** Forms report unsaved edits here, so Salir confirms only when there is something to lose. */
export function UnsavedEditsProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false)
  const value = useMemo(() => ({ dirty, setDirty }), [dirty])
  return <UnsavedEditsContext.Provider value={value}>{children}</UnsavedEditsContext.Provider>
}

export function useUnsavedEdits(): UnsavedEditsValue {
  const value = useContext(UnsavedEditsContext)
  if (!value) throw new Error('useUnsavedEdits needs an UnsavedEditsProvider')
  return value
}
