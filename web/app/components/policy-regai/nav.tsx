'use client'

import type { PolicyRegaiKey } from './i18n'
import type { PolicyRegaiNavKey } from './routes'
import { cn } from '@langgenius/dify-ui/cn'
import { useTranslation } from 'react-i18next'
import LocaleMenu from '@/app/signin/_locale-menu'
import { useLocale } from '@/context/i18n'
import { setLocaleOnClient } from '@/i18n-config'
import { languages } from '@/i18n-config/language'
import Link from '@/next/link'
import { usePathname, useRouter } from '@/next/navigation'
import { tp } from './i18n'
import { POLICY_REGAI_NAV_ITEMS, POLICY_REGAI_ROUTES } from './routes'

const NAV_I18N: Record<PolicyRegaiNavKey, PolicyRegaiKey> = {
  regulations: 'nav.regulations',
  analysis: 'nav.analysis',
  compare: 'nav.compare',
  knowledgeGraph: 'nav.knowledgeGraph',
  assistant: 'nav.assistant',
  updates: 'nav.updates',
}

export function PolicyRegaiNav() {
  const { t } = useTranslation()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-divider-subtle bg-background-default/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href={POLICY_REGAI_ROUTES.compare} className="flex min-w-0 flex-col">
          <span className="truncate system-md-semibold text-text-primary">
            {tp(t, 'brand.title')}
          </span>
          <span className="truncate system-xs-regular text-text-tertiary">
            {tp(t, 'brand.subtitle')}
          </span>
        </Link>
        <nav className="flex flex-1 flex-wrap items-center justify-center gap-1">
          {POLICY_REGAI_NAV_ITEMS.map(({ key, href }) => {
            const isActive = pathname === href || (key === 'compare' && pathname === POLICY_REGAI_ROUTES.root)
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'rounded-lg px-3 py-1.5 system-sm-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-text-secondary hover:bg-state-base-hover hover:text-text-primary',
                )}
              >
                {tp(t, NAV_I18N[key])}
              </Link>
            )
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LocaleMenu
            value={locale}
            items={languages.filter(item => item.supported)}
            onChange={(value) => {
              void setLocaleOnClient(value, false)
              router.refresh()
            }}
          />
          <Link
            href="/signin"
            className="rounded-lg bg-primary-600 px-3 py-1.5 system-sm-medium text-white hover:bg-primary-700"
          >
            {tp(t, 'nav.login')}
          </Link>
        </div>
      </div>
    </header>
  )
}
