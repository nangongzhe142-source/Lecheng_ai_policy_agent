'use client'

import type { PolicyRegaiKey } from './i18n'
import { cn } from '@langgenius/dify-ui/cn'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ANALYSIS_REGULATION_ID, REGULATIONS } from './data'
import { tp } from './i18n'

const ANALYSIS_SECTIONS: {
  key: string
  i18nKey: PolicyRegaiKey
  mockKey: PolicyRegaiKey
}[] = [
  { key: 'requirements', i18nKey: 'analysis.section.requirements', mockKey: 'mock.analysis.reg1.requirements' },
  { key: 'audience', i18nKey: 'analysis.section.audience', mockKey: 'mock.analysis.reg1.audience' },
  { key: 'materials', i18nKey: 'analysis.section.materials', mockKey: 'mock.analysis.reg1.materials' },
  { key: 'risks', i18nKey: 'analysis.section.risks', mockKey: 'mock.analysis.reg1.risks' },
  { key: 'actions', i18nKey: 'analysis.section.actions', mockKey: 'mock.analysis.reg1.actions' },
]

export function AnalysisWorkspace() {
  const { t } = useTranslation()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)

  const selectedRegulations = useMemo(
    () => REGULATIONS.filter(item => selectedIds.includes(item.id)),
    [selectedIds],
  )

  const toggleSelection = (id: string) => {
    setShowResult(false)
    setSelectedIds((prev) => {
      if (prev.includes(id))
        return prev.filter(itemId => itemId !== id)
      return [...prev, id]
    })
  }

  const handleRunAnalysis = () => {
    if (selectedIds.length > 0)
      setShowResult(true)
  }

  const hasAnalysisDemo = selectedIds.includes(ANALYSIS_REGULATION_ID)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="system-2xl-semibold text-text-primary">
          {tp(t, 'analysis.title')}
        </h1>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'analysis.subtitle')}
        </p>
      </div>

      <div className="rounded-2xl border border-divider-subtle bg-background-default p-5">
        <div className="system-sm-semibold text-text-primary">
          {tp(t, 'analysis.selectPolicies')}
        </div>
        <div className="mt-4 space-y-2">
          {REGULATIONS.map(item => (
            <label
              key={item.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3',
                selectedIds.includes(item.id)
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-divider-subtle hover:border-primary-200',
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="mt-1"
              />
              <div>
                <div className="system-sm-medium text-text-primary">
                  {tp(t, item.titleKey)}
                </div>
                <div className="system-xs-regular text-text-tertiary">
                  {tp(t, item.agencyKey)}
                </div>
              </div>
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={handleRunAnalysis}
          className="mt-4 rounded-lg bg-primary-600 px-4 py-2 system-sm-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tp(t, 'analysis.runAnalysis')}
        </button>
      </div>

      {!showResult && (
        <div className="rounded-2xl border border-dashed border-divider-subtle p-10 text-center system-sm-regular text-text-tertiary">
          {tp(t, 'analysis.emptySelection')}
        </div>
      )}

      {showResult && (
        <div className="space-y-4">
          <p className="system-xs-regular text-text-tertiary">
            {tp(t, 'analysis.demoNote')}
          </p>
          {hasAnalysisDemo
            ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {ANALYSIS_SECTIONS.map(section => (
                    <section
                      key={section.key}
                      className="rounded-2xl border border-divider-subtle bg-background-section p-5"
                    >
                      <h2 className="system-sm-semibold text-text-primary">
                        {tp(t, section.i18nKey)}
                      </h2>
                      <p className="mt-2 system-sm-regular text-text-secondary">
                        {tp(t, section.mockKey)}
                      </p>
                    </section>
                  ))}
                  <section className="rounded-2xl border border-divider-subtle bg-background-section p-5 lg:col-span-2">
                    <h2 className="system-sm-semibold text-text-primary">
                      {tp(t, 'analysis.section.evidence')}
                    </h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5 system-sm-regular text-text-secondary">
                      {selectedRegulations.map(item => (
                        <li key={item.id}>
                          {tp(t, item.titleKey)}
                          {' ('}
                          {item.publishedAt}
                          )
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )
            : (
                <div className="rounded-2xl border border-divider-subtle bg-background-section p-5 system-sm-regular text-text-secondary">
                  {selectedRegulations.map(item => tp(t, item.summaryKey)).join(' ')}
                </div>
              )}
        </div>
      )}
    </div>
  )
}
