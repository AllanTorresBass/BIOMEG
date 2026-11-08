'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { strings } from '@/lib/strings'

interface ClientDetailPaneProps {
  open: boolean
  title: string
  children: ReactNode
}

/** Desktop: sticky column. Mobile: sheet so the list stays usable. */
export function ClientDetailPane({ open, title, children }: ClientDetailPaneProps) {
  const router = useRouter()
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)')
    const sync = () => setIsNarrow(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  if (!open) {
    return (
      <div className="hidden rounded-[var(--radius-card)] border border-dashed border-border bg-card p-6 text-muted-foreground lg:block">
        <p>{strings.clients.selectPrompt}</p>
      </div>
    )
  }

  if (isNarrow) {
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) router.push('/clientes')
        }}
      >
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-[var(--radius-card)] p-4">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return <div className="flex flex-col gap-4 lg:sticky lg:top-4">{children}</div>
}
