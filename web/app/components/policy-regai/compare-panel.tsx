'use client'

import type { RegionId } from './data'
import { cn } from '@langgenius/dify-ui/cn'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  COMPARISON_DIMENSION_KEYS,
  REGION_SUMMARIES,
  TOTAL_POLICY_COUNT,
} from './data'
import {
  comparisonDimensionKey,
  comparisonValueKey,
  regionNameKey,
  tp,
} from './i18n'
import { PolicyRegaiAuthorityLinks } from './authority-links'
import { RegionCard, TotalRegionCard } from './region-card'

export function ComparePanel() {
  const { t } = useTranslation()
  const [selectedRegions, setSelectedRegions] = useState<RegionId[]>([])

  const toggleRegion = (regionId: RegionId) => {
    setSelectedRegions((prev) => {
      if (prev.includes(regionId))
        return prev.filter(id => id !== regionId)
      return [...prev, regionId]
    })
  }

  const selectedRegionData = useMemo(
    () => REGION_SUMMARIES.filter(region => selectedRegions.includes(region.id)),
    [selectedRegions],
  )

  const canCompare = selectedRegions.length >= 2

  return (
    <div className="space-y-8">
      <div>
        <h1 className="system-2xl-semibold text-text-primary">
          {tp(t, 'compare.title')}
        </h1>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'compare.subtitle')}
        </p>
      </div>

      <div className="rounded-2xl border border-divider-subtle bg-background-section p-5">
        <div className="system-sm-semibold text-text-primary">
          {tp(t, 'compare.howToUseTitle')}
        </div>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'compare.howToUse')}
        </p>
      </div>

      <div className="rounded-2xl border border-divider-subtle bg-background-section p-5">
        <div className="system-sm-semibold text-text-primary">
          {tp(t, 'links.sectionTitle')}
        </div>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'links.sectionSubtitle')}
        </p>
        <PolicyRegaiAuthorityLinks className="mt-4" />
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="system-lg-semibold text-text-primary">
              {tp(t, 'compare.globalCoverage')}
            </h2>
            <p className="mt-1 system-xs-regular text-text-tertiary">
              {tp(t, 'compare.selectPrompt')}
            </p>
          </div>
          <span className="system-sm-medium text-text-secondary">
            {tp(t, 'compare.selectedCount', { count: selectedRegions.length })}
          </span>
        </div>
        <p className="mt-2 system-xs-regular text-text-quaternary">
          {tp(t, 'compare.regulatorTags')}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {REGION_SUMMARIES.map(region => (
            <RegionCard
              key={region.id}
              region={region}
              selected={selectedRegions.includes(region.id)}
              onToggle={toggleRegion}
            />
          ))}
          <TotalRegionCard totalCount={TOTAL_POLICY_COUNT} />
        </div>
      </div>

      <div className="rounded-2xl border border-divider-subtle bg-background-default p-6">
        {!canCompare
          ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <h3 className="system-md-semibold text-text-primary">
                  {tp(t, 'compare.emptyState')}
                </h3>
              </div>
            )
          : (
              <div className="space-y-6">
                <h3 className="system-lg-semibold text-text-primary">
                  {tp(t, 'compare.resultTitle')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-divider-subtle px-3 py-2 text-left system-xs-semibold text-text-tertiary" />
                        {selectedRegionData.map(region => (
                          <th
                            key={region.id}
                            className="border-b border-divider-subtle px-3 py-2 text-left system-sm-semibold text-text-primary"
                          >
                            {tp(t, regionNameKey(region.id))}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_DIMENSION_KEYS.map(dimensionKey => (
                        <tr key={dimensionKey} className="align-top">
                          <td className="border-b border-divider-subtle px-3 py-3 system-sm-medium text-text-secondary">
                            {tp(t, comparisonDimensionKey(dimensionKey))}
                          </td>
                          {selectedRegionData.map(region => (
                            <td
                              key={`${region.id}-${dimensionKey}`}
                              className={cn(
                                'border-b border-divider-subtle px-3 py-3 system-sm-regular text-text-primary',
                              )}
                            >
                              {tp(t, comparisonValueKey(region.id, dimensionKey))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
      </div>
    </div>
  )
}
