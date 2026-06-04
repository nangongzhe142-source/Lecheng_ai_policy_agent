'use client'

import type { PolicyRegaiKey } from './i18n'
import type { PolicyRegaiNavKey } from './routes'
import { useTranslation } from 'react-i18next'
import Link from '@/next/link'
import { PolicyRegaiAuthorityLinks } from './authority-links'
import { tp } from './i18n'
import { POLICY_REGAI_NAV_ITEMS } from './routes'

const FOOTER_REGION_KEYS = ['lecheng', 'hainan', 'national', 'nmpa'] as const

const NAV_I18N: Record<PolicyRegaiNavKey, PolicyRegaiKey> = {
  regulations: 'nav.regulations',
  analysis: 'nav.analysis',
  compare: 'nav.compare',
  knowledgeGraph: 'nav.knowledgeGraph',
  assistant: 'nav.assistant',
  updates: 'nav.updates',
}

const FOOTER_REGION_I18N: Record<(typeof FOOTER_REGION_KEYS)[number], PolicyRegaiKey> = {
  lecheng: 'footer.region.lecheng',
  hainan: 'footer.region.hainan',
  national: 'footer.region.national',
  nmpa: 'footer.region.nmpa',
}

const COPYRIGHT_YEAR = new Date().getFullYear()

export function PolicyRegaiFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-divider-subtle bg-background-section">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2 xl:grid-cols-4 lg:px-6">
        <div>
          <div className="system-md-semibold text-text-primary">
            {tp(t, 'brand.title')}
          </div>
          <p className="mt-2 system-sm-regular text-text-tertiary">
            {tp(t, 'footer.about')}
          </p>
          <a
            href={`mailto:${tp(t, 'footer.contactEmail')}`}
            className="mt-3 inline-block system-sm-regular text-text-accent"
          >
            {tp(t, 'footer.contactEmail')}
          </a>
        </div>
        <div>
          <div className="system-sm-semibold text-text-primary">
            {tp(t, 'footer.quickLinks')}
          </div>
          <ul className="mt-3 space-y-2">
            {POLICY_REGAI_NAV_ITEMS.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className="system-sm-regular text-text-secondary hover:text-text-accent">
                  {tp(t, NAV_I18N[key])}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="system-sm-semibold text-text-primary">
            {tp(t, 'footer.coveredRegions')}
          </div>
          <ul className="mt-3 space-y-2">
            {FOOTER_REGION_KEYS.map(regionKey => (
              <li key={regionKey} className="system-sm-regular text-text-secondary">
                {tp(t, FOOTER_REGION_I18N[regionKey])}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="system-sm-semibold text-text-primary">
            {tp(t, 'footer.authorityLinks')}
          </div>
          <PolicyRegaiAuthorityLinks variant="footer" />
        </div>
      </div>
      <div className="border-t border-divider-subtle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
          <span className="system-xs-regular text-text-quaternary">
            {tp(t, 'footer.copyright', { year: COPYRIGHT_YEAR })}
          </span>
          <div className="flex flex-wrap gap-4">
            <span className="system-xs-regular text-text-quaternary">
              {tp(t, 'footer.privacyLink')}
            </span>
            <span className="system-xs-regular text-text-quaternary">
              {tp(t, 'footer.termsLink')}
            </span>
            <span className="system-xs-regular text-text-quaternary">
              {tp(t, 'footer.disclaimerLink')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
