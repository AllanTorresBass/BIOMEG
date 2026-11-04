import Image from 'next/image'
import { strings } from '@/lib/strings'
import type { LogoLockupProps } from '@/types/brand/brand.types'

const LOCKUP_WIDTH = 744
const LOCKUP_HEIGHT = 327
const MIN_DISPLAY_WIDTH = 320

/**
 * The lockup file already includes the clear space of a quarter of the emblem.
 * It is never shown under 320px wide, and never inside a card, cell, or button.
 */
export function LogoLockup({ width = MIN_DISPLAY_WIDTH }: LogoLockupProps) {
  const displayWidth = Math.max(MIN_DISPLAY_WIDTH, width)
  return (
    <Image
      src="/logo-lockup.png"
      alt={strings.brand.logoAlt}
      width={displayWidth}
      height={Math.round((displayWidth * LOCKUP_HEIGHT) / LOCKUP_WIDTH)}
      unoptimized
      priority
    />
  )
}
