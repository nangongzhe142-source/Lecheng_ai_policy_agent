'use client'

import { useTranslation } from 'react-i18next'
import { tp } from './i18n'

export function PolicyRegaiDisclaimer() {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-divider-subtle bg-background-section px-4 py-3 system-xs-regular text-text-tertiary">
      {tp(t, 'disclaimer.text')}
    </div>
  )
}
