'use client'

import type { PolicyCategoryId, RegionId, RegulationItem, RegulationType } from './data'
import type { PolicyRegaiKey } from './i18n'
import { cn } from '@langgenius/dify-ui/cn'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogTitle,
} from '@langgenius/dify-ui/dialog'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from '@/next/link'
import { basePath } from '@/utils/var'
import { PolicyRegaiAuthorityLinks } from './authority-links'
import { REGULATIONS } from './data'
import { categoryNameKey, policyCategoryIds, regionNameKey, tp } from './i18n'

const TYPE_I18N: Record<RegulationType, PolicyRegaiKey> = {
  incentive: 'regulations.type.incentive',
  registration: 'regulations.type.registration',
  clinical: 'regulations.type.clinical',
  general: 'regulations.type.general',
}

export function RegulationList() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<RegionId | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<PolicyCategoryId | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<RegulationType | 'all'>('all')
  const [selectedRegulation, setSelectedRegulation] = useState<RegulationItem | null>(null)

  const filteredRegulations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return REGULATIONS
      .filter((item) => {
        if (regionFilter !== 'all' && item.regionId !== regionFilter)
          return false
        if (categoryFilter !== 'all' && item.categoryId !== categoryFilter)
          return false
        if (typeFilter !== 'all' && item.type !== typeFilter)
          return false
        if (!query)
          return true
        const haystack = [
          tp(t, item.titleKey),
          tp(t, item.agencyKey),
          tp(t, item.summaryKey),
          tp(t, categoryNameKey(item.categoryId)),
        ].join(' ').toLowerCase()
        return haystack.includes(query)
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [categoryFilter, regionFilter, search, t, typeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="system-2xl-semibold text-text-primary">
          {tp(t, 'regulations.title')}
        </h1>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'regulations.subtitle')}
        </p>
        <p className="mt-1 system-xs-regular text-text-tertiary">
          {tp(t, 'regulations.documentCount', { count: REGULATIONS.length })}
        </p>
        <PolicyRegaiAuthorityLinks className="mt-4" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <input
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder={tp(t, 'regulations.searchPlaceholder')}
          className="w-full rounded-xl border border-divider-subtle bg-background-default px-4 py-2.5 system-sm-regular text-text-primary outline-none focus:border-primary-600 lg:min-w-[240px] lg:flex-1"
        />
        <select
          value={categoryFilter}
          onChange={event => setCategoryFilter(event.target.value as PolicyCategoryId | 'all')}
          className="rounded-xl border border-divider-subtle bg-background-default px-3 py-2.5 system-sm-regular text-text-primary"
          aria-label={tp(t, 'regulations.filterCategory')}
        >
          <option value="all">{tp(t, 'regulations.filterAll')}</option>
          {policyCategoryIds().map(categoryId => (
            <option key={categoryId} value={categoryId}>
              {tp(t, categoryNameKey(categoryId))}
            </option>
          ))}
        </select>
        <select
          value={regionFilter}
          onChange={event => setRegionFilter(event.target.value as RegionId | 'all')}
          className="rounded-xl border border-divider-subtle bg-background-default px-3 py-2.5 system-sm-regular text-text-primary"
          aria-label={tp(t, 'regulations.filterRegion')}
        >
          <option value="all">{tp(t, 'regulations.filterAll')}</option>
          {(['lecheng', 'hainan', 'national', 'nmpa'] as RegionId[]).map(regionId => (
            <option key={regionId} value={regionId}>
              {tp(t, regionNameKey(regionId))}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={event => setTypeFilter(event.target.value as RegulationType | 'all')}
          className="rounded-xl border border-divider-subtle bg-background-default px-3 py-2.5 system-sm-regular text-text-primary"
          aria-label={tp(t, 'regulations.filterType')}
        >
          <option value="all">{tp(t, 'regulations.filterAll')}</option>
          {(Object.keys(TYPE_I18N) as RegulationType[]).map(type => (
            <option key={type} value={type}>
              {tp(t, TYPE_I18N[type])}
            </option>
          ))}
        </select>
      </div>

      <p className="system-xs-regular text-text-tertiary">
        {tp(t, 'regulations.sortByDate')}
      </p>

      {filteredRegulations.length === 0
        ? (
            <div className="rounded-2xl border border-dashed border-divider-subtle p-10 text-center system-sm-regular text-text-tertiary">
              {tp(t, 'regulations.noResults')}
            </div>
          )
        : (
            <div className="grid gap-4">
              {filteredRegulations.map(item => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-divider-subtle bg-background-default p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="system-md-semibold text-text-primary">
                        {tp(t, item.titleKey)}
                      </h2>
                      <p className="mt-1 system-xs-regular text-text-tertiary">
                        {tp(t, categoryNameKey(item.categoryId))}
                        {' · '}
                        {tp(t, item.agencyKey)}
                        {' · '}
                        {tp(t, regionNameKey(item.regionId))}
                        {' · '}
                        {item.publishedAt}
                      </p>
                    </div>
                    <span className="rounded-full bg-background-section px-3 py-1 system-xs-medium text-text-secondary">
                      {tp(t, TYPE_I18N[item.type])}
                    </span>
                  </div>
                  <p className="mt-3 system-sm-regular text-text-secondary">
                    {tp(t, item.summaryKey)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRegulation(item)}
                      className="system-sm-medium text-text-accent hover:underline"
                    >
                      {tp(t, 'regulations.viewDetail')}
                    </button>
                    <Link
                      href={`${basePath}${item.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="system-sm-medium text-text-accent hover:underline"
                    >
                      {tp(t, 'regulations.openDocument')}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

      <Dialog
        open={selectedRegulation !== null}
        onOpenChange={(open) => {
          if (!open)
            setSelectedRegulation(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle>{tp(t, 'regulations.detailTitle')}</DialogTitle>
            <DialogCloseButton />
          </div>
          {selectedRegulation && (
            <div className="mt-4 space-y-3 system-sm-regular text-text-secondary">
              <DetailRow label={tp(t, 'regulations.filterCategory')} value={tp(t, categoryNameKey(selectedRegulation.categoryId))} />
              <DetailRow label={tp(t, 'regulations.field.agency')} value={tp(t, selectedRegulation.agencyKey)} />
              <DetailRow label={tp(t, 'regulations.field.region')} value={tp(t, regionNameKey(selectedRegulation.regionId))} />
              <DetailRow label={tp(t, 'regulations.field.type')} value={tp(t, TYPE_I18N[selectedRegulation.type])} />
              <DetailRow label={tp(t, 'regulations.field.date')} value={selectedRegulation.publishedAt} />
              <DetailRow label={tp(t, 'regulations.field.audience')} value={tp(t, selectedRegulation.audienceKey)} />
              <DetailRow label={tp(t, 'regulations.field.summary')} value={tp(t, selectedRegulation.summaryKey)} />
              <div>
                <div className="system-xs-semibold text-text-tertiary">{tp(t, 'regulations.field.source')}</div>
                <Link
                  href={`${basePath}${selectedRegulation.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('mt-1 inline-block text-text-accent hover:underline')}
                >
                  {tp(t, 'regulations.openDocument')}
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="system-xs-semibold text-text-tertiary">{label}</div>
      <div className={cn('mt-1 text-text-primary')}>{value}</div>
    </div>
  )
}
