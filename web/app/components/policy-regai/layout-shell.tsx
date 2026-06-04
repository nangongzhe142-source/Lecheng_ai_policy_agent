'use client'

import type { ReactNode } from 'react'
import { PolicyRegaiDisclaimer } from './disclaimer'
import { PolicyRegaiFooter } from './footer'
import { PolicyRegaiNav } from './nav'
import { usePolicyRegaiDocumentTitle } from './use-policy-regai-document-title'

type PolicyRegaiLayoutShellProps = {
  children: ReactNode
}

export function PolicyRegaiLayoutShell({ children }: PolicyRegaiLayoutShellProps) {
  usePolicyRegaiDocumentTitle()

  return (
    <div className="flex min-h-dvh flex-col bg-background-default">
      <PolicyRegaiNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-6">
        {children}
        <div className="mt-10">
          <PolicyRegaiDisclaimer />
        </div>
      </main>
      <PolicyRegaiFooter />
    </div>
  )
}
