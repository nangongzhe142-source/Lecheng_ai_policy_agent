import type { PolicyRegaiKey } from './i18n'
import { POLICY_DOCUMENT_REGULATIONS } from './policy-documents.generated'

export type RegionId = 'lecheng' | 'hainan' | 'national' | 'nmpa'

export type RegulationType = 'incentive' | 'registration' | 'clinical' | 'general'

export type UpdateType = 'new' | 'amended' | 'interpretation'

export type ComparisonDimensionKey
  = 'scope'
    | 'regulator'
    | 'access'
    | 'materials'
    | 'timeline'
    | 'risk'
    | 'recommendation'

export type RegionSummary = {
  id: RegionId
  policyCount: number
  icon: string
}

export type PolicyCategoryId
  = | 'zeroTariff'
    | 'specialDevice'
    | 'biomedical'
    | 'ePrescription'
    | 'foodImport'
    | 'biomedicalCompilation'

export type RegulationItem = {
  id: string
  categoryId: PolicyCategoryId
  regionId: RegionId
  type: RegulationType
  publishedAt: string
  titleKey: PolicyRegaiKey
  agencyKey: PolicyRegaiKey
  audienceKey: PolicyRegaiKey
  summaryKey: PolicyRegaiKey
  fileUrl: string
}

export type PolicyUpdate = {
  id: string
  regionId: RegionId
  type: UpdateType
  publishedAt: string
  titleKey: PolicyRegaiKey
  sourceKey: PolicyRegaiKey
  impactKey: PolicyRegaiKey
  summaryKey: PolicyRegaiKey
}

export type GraphNodeType
  = | 'category'
    | 'policy'
    | 'agency'
    | 'entity'
    | 'material'
    | 'risk'
    | 'region'

export type GraphNode = {
  id: string
  type: GraphNodeType
  labelKey: PolicyRegaiKey
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  relationKey: PolicyRegaiKey
}

export const COMPARISON_DIMENSION_KEYS: ComparisonDimensionKey[] = [
  'scope',
  'regulator',
  'access',
  'materials',
  'timeline',
  'risk',
  'recommendation',
]

export const REGION_SUMMARIES: RegionSummary[] = [
  {
    id: 'lecheng',
    policyCount: POLICY_DOCUMENT_REGULATIONS.filter(item => item.regionId === 'lecheng').length,
    icon: '🏥',
  },
  {
    id: 'hainan',
    policyCount: POLICY_DOCUMENT_REGULATIONS.filter(item => item.regionId === 'hainan').length,
    icon: '🌴',
  },
  {
    id: 'national',
    policyCount: 0,
    icon: '🏛️',
  },
  {
    id: 'nmpa',
    policyCount: 0,
    icon: '💊',
  },
]

export const TOTAL_POLICY_COUNT = REGION_SUMMARIES.reduce((sum, region) => sum + region.policyCount, 0)

export const REGULATIONS: RegulationItem[] = POLICY_DOCUMENT_REGULATIONS

export const POLICY_UPDATES: PolicyUpdate[] = [
  {
    id: 'upd-1',
    regionId: 'lecheng',
    type: 'amended',
    publishedAt: '2026-05-18',
    titleKey: 'mock.update1.title',
    sourceKey: 'mock.update1.source',
    impactKey: 'mock.update1.impact',
    summaryKey: 'mock.update1.summary',
  },
  {
    id: 'upd-2',
    regionId: 'hainan',
    type: 'new',
    publishedAt: '2026-04-02',
    titleKey: 'mock.update2.title',
    sourceKey: 'mock.update2.source',
    impactKey: 'mock.update2.impact',
    summaryKey: 'mock.update2.summary',
  },
  {
    id: 'upd-3',
    regionId: 'nmpa',
    type: 'interpretation',
    publishedAt: '2026-03-11',
    titleKey: 'mock.update3.title',
    sourceKey: 'mock.update3.source',
    impactKey: 'mock.update3.impact',
    summaryKey: 'mock.update3.summary',
  },
]

export const ANALYSIS_REGULATION_ID = POLICY_DOCUMENT_REGULATIONS[0]?.id ?? 'zeroTariff-001'
