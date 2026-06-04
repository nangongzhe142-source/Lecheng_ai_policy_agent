import type { TFunction } from 'i18next'
import type { ComparisonDimensionKey, PolicyCategoryId, RegionId } from './data'
import type { Resources } from '@/i18n-config/resources'

export type PolicyRegaiKey = keyof Resources['policyRegai']

export function tp(
  t: TFunction,
  key: PolicyRegaiKey,
  options?: Record<string, unknown>,
) {
  return t(key, { ns: 'policyRegai', ...options })
}

const REGION_NAME_KEYS: Record<RegionId, PolicyRegaiKey> = {
  lecheng: 'region.lecheng.name',
  hainan: 'region.hainan.name',
  national: 'region.national.name',
  nmpa: 'region.nmpa.name',
}

const REGION_REGULATOR_KEYS: Record<RegionId, PolicyRegaiKey> = {
  lecheng: 'region.lecheng.regulator',
  hainan: 'region.hainan.regulator',
  national: 'region.national.regulator',
  nmpa: 'region.nmpa.regulator',
}

const COMPARISON_VALUE_KEYS: Record<RegionId, Record<ComparisonDimensionKey, PolicyRegaiKey>> = {
  lecheng: {
    scope: 'mock.compare.lecheng.scope',
    regulator: 'mock.compare.lecheng.regulator',
    access: 'mock.compare.lecheng.access',
    materials: 'mock.compare.lecheng.materials',
    timeline: 'mock.compare.lecheng.timeline',
    risk: 'mock.compare.lecheng.risk',
    recommendation: 'mock.compare.lecheng.recommendation',
  },
  hainan: {
    scope: 'mock.compare.hainan.scope',
    regulator: 'mock.compare.hainan.regulator',
    access: 'mock.compare.hainan.access',
    materials: 'mock.compare.hainan.materials',
    timeline: 'mock.compare.hainan.timeline',
    risk: 'mock.compare.hainan.risk',
    recommendation: 'mock.compare.hainan.recommendation',
  },
  national: {
    scope: 'mock.compare.national.scope',
    regulator: 'mock.compare.national.regulator',
    access: 'mock.compare.national.access',
    materials: 'mock.compare.national.materials',
    timeline: 'mock.compare.national.timeline',
    risk: 'mock.compare.national.risk',
    recommendation: 'mock.compare.national.recommendation',
  },
  nmpa: {
    scope: 'mock.compare.nmpa.scope',
    regulator: 'mock.compare.nmpa.regulator',
    access: 'mock.compare.nmpa.access',
    materials: 'mock.compare.nmpa.materials',
    timeline: 'mock.compare.nmpa.timeline',
    risk: 'mock.compare.nmpa.risk',
    recommendation: 'mock.compare.nmpa.recommendation',
  },
}

export function regionNameKey(regionId: RegionId): PolicyRegaiKey {
  return REGION_NAME_KEYS[regionId]
}

export function regionRegulatorKey(regionId: RegionId): PolicyRegaiKey {
  return REGION_REGULATOR_KEYS[regionId]
}

export function comparisonValueKey(
  regionId: RegionId,
  dimensionKey: ComparisonDimensionKey,
): PolicyRegaiKey {
  return COMPARISON_VALUE_KEYS[regionId][dimensionKey]
}

export function comparisonDimensionKey(dimensionKey: ComparisonDimensionKey): PolicyRegaiKey {
  const map: Record<ComparisonDimensionKey, PolicyRegaiKey> = {
    scope: 'compare.dimension.scope',
    regulator: 'compare.dimension.regulator',
    access: 'compare.dimension.access',
    materials: 'compare.dimension.materials',
    timeline: 'compare.dimension.timeline',
    risk: 'compare.dimension.risk',
    recommendation: 'compare.dimension.recommendation',
  }
  return map[dimensionKey]
}

const POLICY_CATEGORY_IDS: PolicyCategoryId[] = [
  'zeroTariff',
  'specialDevice',
  'biomedical',
  'ePrescription',
  'foodImport',
  'biomedicalCompilation',
]

export function policyCategoryIds(): PolicyCategoryId[] {
  return POLICY_CATEGORY_IDS
}

export function categoryNameKey(categoryId: PolicyCategoryId): PolicyRegaiKey {
  const map: Record<PolicyCategoryId, PolicyRegaiKey> = {
    zeroTariff: 'category.zeroTariff.name',
    specialDevice: 'category.specialDevice.name',
    biomedical: 'category.biomedical.name',
    ePrescription: 'category.ePrescription.name',
    foodImport: 'category.foodImport.name',
    biomedicalCompilation: 'category.biomedicalCompilation.name',
  }
  return map[categoryId]
}
