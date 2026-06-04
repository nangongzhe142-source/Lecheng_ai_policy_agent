'use client'

import { useTranslation } from 'react-i18next'
import { getPolicyAgentChatbotUrl } from '@/config/policy-agent'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import Link from '@/next/link'
import { basePath } from '@/utils/var'
import { tp } from './i18n'
import { POLICY_REGAI_ROUTES } from './routes'

export function PolicyRegaiChatbotFrame() {
  const { t } = useTranslation()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const chatbotUrl = getPolicyAgentChatbotUrl(basePath)

  if (!chatbotUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-divider-subtle p-10 text-center system-sm-regular text-text-tertiary">
        {tp(t, 'assistant.configMissing')}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-divider-subtle bg-background-section p-6">
        <Link
          href={chatbotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary-600 px-4 py-2 system-sm-medium text-white hover:bg-primary-700"
        >
          {tp(t, 'assistant.openFullScreen')}
        </Link>
      </div>
    )
  }

  return (
    <iframe
      src={chatbotUrl}
      title={tp(t, 'assistant.iframeTitle')}
      allow="microphone"
      className="min-h-[700px] w-full rounded-2xl border border-divider-subtle bg-background-default"
    />
  )
}

export function PolicyRegaiAssistantPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="system-2xl-semibold text-text-primary">
          {tp(t, 'assistant.title')}
        </h1>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'assistant.subtitle')}
        </p>
      </div>
      <PolicyRegaiChatbotFrame />
      <p className="system-xs-regular text-text-tertiary">
        <Link href={POLICY_REGAI_ROUTES.compare} className="text-text-accent hover:underline">
          {tp(t, 'nav.compare')}
        </Link>
      </p>
    </div>
  )
}
