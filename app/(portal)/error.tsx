'use client'

import { RouteError } from '@/components/shared/RouteError'
import type { RouteErrorProps } from '@/types/shared/providers.types'

export default function Error(props: RouteErrorProps) {
  return <RouteError {...props} />
}
