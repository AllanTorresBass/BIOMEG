'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { strings } from '@/lib/strings'
import { cn } from '@/lib/utils/cn'
import type { MenuBarGroup } from '@/types/shell/menu-bar.props'

/** Only groups with at least one reachable item arrive here. Others are absent, not greyed. */
export function MenuBar({ groups }: { groups: MenuBarGroup[] }) {
  const [openLabel, setOpenLabel] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!openLabel) return
    function onPointer(event: PointerEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenLabel(null)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenLabel(null)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [openLabel])

  return (
    <nav ref={navRef} aria-label={strings.shell.menuLabel} className="border-b border-border bg-card">
      <ul className="flex flex-wrap px-4">
        {groups.map((group) => {
          const isOpen = openLabel === group.label
          const panelId = `menu-${group.label.replace(/\s+/g, '-').toLowerCase()}`
          return (
            <li key={group.label} className="relative">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenLabel(isOpen ? null : group.label)}
                className={cn(
                  'flex h-10 items-center gap-1 px-3 font-semibold',
                  isOpen ? 'bg-sunken text-foreground' : 'text-foreground',
                )}
              >
                {group.label}
                <ChevronDown aria-hidden className="size-4" />
              </button>
              {isOpen ? (
                <ul
                  id={panelId}
                  className="absolute left-0 top-full z-20 max-h-[70vh] min-w-64 overflow-y-auto rounded-b-[var(--radius-card)] border border-border bg-card py-1 shadow-md"
                >
                  {group.items.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/p/${entry.slug}`}
                        onClick={() => setOpenLabel(null)}
                        className="block px-4 py-2 hover:bg-sunken"
                      >
                        {entry.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
