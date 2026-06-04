'use client'

import { cn } from '@langgenius/dify-ui/cn'
import { useTranslation } from 'react-i18next'
import { POLICY_AUTHORITY_LINKS } from './external-links'
import { tp } from './i18n'

type AuthorityLinksProps = {
  variant?: 'footer' | 'inline'
  className?: string
}

export function PolicyRegaiAuthorityLinks({ variant = 'inline', className }: AuthorityLinksProps) {
  const { t } = useTranslation()

  if (variant === 'footer') {
    return (
      <ul className={cn('mt-3 space-y-3', className)}>
        {POLICY_AUTHORITY_LINKS.map(link => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <span className="system-sm-medium text-text-secondary group-hover:text-text-accent">
                {tp(t, link.labelKey)}
                <span className="ml-1 inline-block opacity-70" aria-hidden="true">↗</span>
              </span>
              <span className="mt-0.5 block system-xs-regular text-text-tertiary">
                {tp(t, link.descriptionKey)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {POLICY_AUTHORITY_LINKS.map(link => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full flex-col rounded-xl border border-divider-subtle bg-background-default px-4 py-3 transition-colors hover:border-primary-300 hover:bg-primary-50/40"
        >
          <span className="system-sm-medium text-text-primary">
            {tp(t, link.labelKey)}
            <span className="ml-1 text-text-tertiary" aria-hidden="true">↗</span>
          </span>
          <span className="mt-1 system-xs-regular text-text-tertiary">
            {tp(t, link.descriptionKey)}
          </span>
        </a>
      ))}
    </div>
  )
}
