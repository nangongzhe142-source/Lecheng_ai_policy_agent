'use client'

import type { RegionId, RegionSummary } from './data'
import { cn } from '@langgenius/dify-ui/cn'
import { useTranslation } from 'react-i18next'
import { regionNameKey, regionRegulatorKey, tp } from './i18n'

type RegionCardProps = {
  region: RegionSummary
  selected: boolean
  onToggle: (regionId: RegionId) => void
}

export function RegionCard({ region, selected, onToggle }: RegionCardProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={() => onToggle(region.id)}
      className={cn(
        'flex w-full flex-col rounded-2xl border p-5 text-left transition-all',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-sm'
          : 'border-divider-subtle bg-background-default hover:border-primary-200 hover:shadow-sm',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl" aria-hidden>{region.icon}</span>
        {selected && (
          <span className="rounded-full bg-primary-600 px-2 py-0.5 system-xs-medium text-white">
            ✓
          </span>
        )}
      </div>
      <div className="mt-3 system-md-semibold text-text-primary">
        {tp(t, regionNameKey(region.id))}
      </div>
      <div className="mt-1 system-xs-regular text-text-tertiary">
        {tp(t, regionRegulatorKey(region.id))}
      </div>
      <div className="system-2xl-semibold mt-4 text-primary-600">
        {region.policyCount}
      </div>
    </button>
  )
}

type TotalRegionCardProps = {
  totalCount: number
}

export function TotalRegionCard({ totalCount }: TotalRegionCardProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col rounded-2xl border border-dashed border-divider-subtle bg-background-section p-5">
      <span className="text-2xl" aria-hidden>🌍</span>
      <div className="mt-3 system-md-semibold text-text-primary">
        {tp(t, 'region.total.name')}
      </div>
      <div className="mt-1 system-xs-regular text-text-tertiary">
        {tp(t, 'region.total.description')}
      </div>
      <div className="system-2xl-semibold mt-4 text-text-primary">
        {totalCount}
      </div>
    </div>
  )
}
