'use client'

import type { PolicyUpdate, RegionId, UpdateType } from './data'
import type { PolicyRegaiKey } from './i18n'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from '@/next/link'
import { POLICY_UPDATES } from './data'
import { regionNameKey, tp } from './i18n'
import { POLICY_REGAI_ROUTES } from './routes'

const UPDATE_TYPE_I18N: Record<UpdateType, PolicyRegaiKey> = {
  new: 'updates.type.new',
  amended: 'updates.type.amended',
  interpretation: 'updates.type.interpretation',
}

export function UpdatesList() {
  const { t } = useTranslation()
  const [regionFilter, setRegionFilter] = useState<RegionId | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<UpdateType | 'all'>('all')

  const filteredUpdates = useMemo(() => {
    return POLICY_UPDATES
      .filter((item) => {
        if (regionFilter !== 'all' && item.regionId !== regionFilter)
          return false
        if (typeFilter !== 'all' && item.type !== typeFilter)
          return false
        return true
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [regionFilter, typeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="system-2xl-semibold text-text-primary">
          {tp(t, 'updates.title')}
        </h1>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'updates.subtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={regionFilter}
          onChange={event => setRegionFilter(event.target.value as RegionId | 'all')}
          className="rounded-xl border border-divider-subtle bg-background-default px-3 py-2.5 system-sm-regular"
          aria-label={tp(t, 'updates.filterRegion')}
        >
          <option value="all">{tp(t, 'updates.filterAll')}</option>
          {(['lecheng', 'hainan', 'national', 'nmpa'] as RegionId[]).map(regionId => (
            <option key={regionId} value={regionId}>
              {tp(t, regionNameKey(regionId))}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={event => setTypeFilter(event.target.value as UpdateType | 'all')}
          className="rounded-xl border border-divider-subtle bg-background-default px-3 py-2.5 system-sm-regular"
          aria-label={tp(t, 'updates.filterType')}
        >
          <option value="all">{tp(t, 'updates.filterAll')}</option>
          {(Object.keys(UPDATE_TYPE_I18N) as UpdateType[]).map(type => (
            <option key={type} value={type}>
              {tp(t, UPDATE_TYPE_I18N[type])}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled
          title={tp(t, 'updates.subscribeHint')}
          className="rounded-lg border border-divider-subtle px-4 py-2.5 system-sm-medium text-text-tertiary"
        >
          {tp(t, 'updates.subscribe')}
        </button>
      </div>

      <div className="grid gap-4">
        {filteredUpdates.map(item => (
          <UpdateCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function UpdateCard({ item }: { item: PolicyUpdate }) {
  const { t } = useTranslation()

  return (
    <article className="rounded-2xl border border-divider-subtle bg-background-default p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background-section px-3 py-1 system-xs-medium text-text-secondary">
          {tp(t, UPDATE_TYPE_I18N[item.type])}
        </span>
        <span className="system-xs-regular text-text-tertiary">{item.publishedAt}</span>
        <span className="system-xs-regular text-text-tertiary">
          {tp(t, regionNameKey(item.regionId))}
        </span>
      </div>
      <h2 className="mt-3 system-md-semibold text-text-primary">
        {tp(t, item.titleKey)}
      </h2>
      <p className="mt-2 system-sm-regular text-text-secondary">
        {tp(t, item.summaryKey)}
      </p>
      <p className="mt-2 system-xs-regular text-text-tertiary">
        {tp(t, item.sourceKey)}
        {' · '}
        {tp(t, item.impactKey)}
      </p>
      <Link
        href={POLICY_REGAI_ROUTES.assistant}
        className="mt-4 inline-block system-sm-medium text-text-accent hover:underline"
      >
        {tp(t, 'updates.askAssistant')}
      </Link>
    </article>
  )
}
