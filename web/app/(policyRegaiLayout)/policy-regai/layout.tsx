'use client'

import type { ReactNode } from 'react'
import { PolicyRegaiLayoutShell } from '@/app/components/policy-regai/layout-shell'

export default function PolicyRegaiLayout({ children }: { children: ReactNode }) {
  return <PolicyRegaiLayoutShell>{children}</PolicyRegaiLayoutShell>
}
