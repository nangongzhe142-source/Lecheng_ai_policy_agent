import type { PolicyCategoryId, RegionId, RegulationItem } from './data'
import type { PolicyRegaiKey } from './i18n'
import type { Edge, Node } from 'reactflow'
import { REGULATIONS } from './data'

export type GraphNodeType
  = | 'category'
    | 'policy'
    | 'agency'
    | 'entity'
    | 'material'
    | 'risk'
    | 'region'

export type KnowledgeGraphNodeData = {
  graphType: GraphNodeType
  labelKey: PolicyRegaiKey
  categoryId?: PolicyCategoryId
  regionId?: RegionId
  regulationId?: string
  fileUrl?: string
  documentCount?: number
  dimmed?: boolean
}

export type KnowledgeGraphBuildOptions = {
  categoryFilter: PolicyCategoryId | 'all'
  showPolicies: boolean
  maxPoliciesPerCategory: number
}

export type KnowledgeGraphEdgeData = {
  relationKey: KnowledgeGraphRelationKey
}

export type KnowledgeGraphRelationKey = PolicyRegaiKey

const CATEGORY_ORDER: PolicyCategoryId[] = [
  'zeroTariff',
  'specialDevice',
  'biomedical',
  'ePrescription',
  'foodImport',
  'biomedicalCompilation',
]

const CATEGORY_GRID: Array<{ col: number, row: number }> = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 2, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
]

const CLUSTER_WIDTH = 360
const CLUSTER_HEIGHT = 320
const ORIGIN_X = 80
const ORIGIN_Y = 60

function categoryCenter(index: number) {
  const grid = CATEGORY_GRID[index] ?? { col: 0, row: 0 }
  return {
    x: ORIGIN_X + grid.col * CLUSTER_WIDTH + CLUSTER_WIDTH / 2,
    y: ORIGIN_Y + grid.row * CLUSTER_HEIGHT + CLUSTER_HEIGHT / 2,
  }
}

function nodeId(type: GraphNodeType, key: string) {
  return `${type}-${key}`
}

function regulationsByCategory(categoryId: PolicyCategoryId): RegulationItem[] {
  return REGULATIONS.filter(item => item.categoryId === categoryId)
}

function materialKey(categoryId: PolicyCategoryId): PolicyRegaiKey {
  return `knowledgeGraph.material.${categoryId}` as PolicyRegaiKey
}

function riskKey(categoryId: PolicyCategoryId): PolicyRegaiKey {
  return `knowledgeGraph.risk.${categoryId}` as PolicyRegaiKey
}

function categoryNameKey(categoryId: PolicyCategoryId): PolicyRegaiKey {
  return `category.${categoryId}.name` as PolicyRegaiKey
}

function regionNameKey(regionId: RegionId): PolicyRegaiKey {
  return `region.${regionId}.name` as PolicyRegaiKey
}

export function buildKnowledgeGraph(
  options: KnowledgeGraphBuildOptions,
): { nodes: Node<KnowledgeGraphNodeData>[], edges: Edge<KnowledgeGraphEdgeData>[] } {
  const nodes: Node<KnowledgeGraphNodeData>[] = []
  const edges: Edge<KnowledgeGraphEdgeData>[] = []
  const activeCategories = options.categoryFilter === 'all'
    ? CATEGORY_ORDER
    : [options.categoryFilter]

  const regionIds = new Set<RegionId>()

  for (const categoryId of activeCategories) {
    const index = CATEGORY_ORDER.indexOf(categoryId)
    const center = categoryCenter(index)
    const docs = regulationsByCategory(categoryId)
    const sample = docs[0]
    if (!sample)
      continue

    regionIds.add(sample.regionId)

    const categoryNodeId = nodeId('category', categoryId)
    nodes.push({
      id: categoryNodeId,
      type: 'policyGraph',
      position: { x: center.x - 90, y: center.y - 24 },
      data: {
        graphType: 'category',
        labelKey: categoryNameKey(categoryId),
        categoryId,
        documentCount: docs.length,
      },
    })

    const satellites: Array<{
      type: Exclude<GraphNodeType, 'category' | 'policy' | 'region'>
      labelKey: PolicyRegaiKey
      offset: { x: number, y: number }
      relationKey: KnowledgeGraphRelationKey
    }> = [
      {
        type: 'agency',
        labelKey: sample.agencyKey,
        offset: { x: -150, y: -110 },
        relationKey: 'knowledgeGraph.relation.issuedBy',
      },
      {
        type: 'entity',
        labelKey: sample.audienceKey,
        offset: { x: 150, y: -110 },
        relationKey: 'knowledgeGraph.relation.appliesTo',
      },
      {
        type: 'material',
        labelKey: materialKey(categoryId),
        offset: { x: -150, y: 110 },
        relationKey: 'knowledgeGraph.relation.requires',
      },
      {
        type: 'risk',
        labelKey: riskKey(categoryId),
        offset: { x: 150, y: 110 },
        relationKey: 'knowledgeGraph.relation.riskOf',
      },
    ]

    for (const satellite of satellites) {
      const satelliteId = nodeId(satellite.type, categoryId)
      nodes.push({
        id: satelliteId,
        type: 'policyGraph',
        position: {
          x: center.x + satellite.offset.x - 80,
          y: center.y + satellite.offset.y - 20,
        },
        data: {
          graphType: satellite.type,
          labelKey: satellite.labelKey,
          categoryId,
        },
      })
      edges.push({
        id: `e-${categoryNodeId}-${satelliteId}`,
        source: categoryNodeId,
        target: satelliteId,
        label: satellite.relationKey,
        type: 'smoothstep',
        animated: false,
        data: { relationKey: satellite.relationKey },
      })
    }

    if (options.showPolicies) {
      const visibleDocs = docs.slice(0, options.maxPoliciesPerCategory)
      visibleDocs.forEach((doc, docIndex) => {
        const policyId = nodeId('policy', doc.id)
        const column = docIndex % 3
        const row = Math.floor(docIndex / 3)
        nodes.push({
          id: policyId,
          type: 'policyGraph',
          position: {
            x: center.x - 120 + column * 130,
            y: center.y + 170 + row * 72,
          },
          data: {
            graphType: 'policy',
            labelKey: doc.titleKey,
            categoryId,
            regulationId: doc.id,
            fileUrl: doc.fileUrl,
          },
        })
        edges.push({
          id: `e-${policyId}-${categoryNodeId}`,
          source: policyId,
          target: categoryNodeId,
          label: 'knowledgeGraph.relation.belongsTo',
          type: 'smoothstep',
          data: { relationKey: 'knowledgeGraph.relation.belongsTo' as KnowledgeGraphRelationKey },
        })
      })
    }
  }

  if (options.categoryFilter === 'all') {
    let regionIndex = 0
    for (const regionId of regionIds) {
      const categoriesInRegion = activeCategories.filter((categoryId) => {
        const doc = regulationsByCategory(categoryId)[0]
        return doc?.regionId === regionId
      })
      if (categoriesInRegion.length === 0)
        continue

      const regionNodeId = nodeId('region', regionId)
      nodes.push({
        id: regionNodeId,
        type: 'policyGraph',
        position: { x: ORIGIN_X - 20 + regionIndex * 180, y: ORIGIN_Y - 80 },
        data: {
          graphType: 'region',
          labelKey: regionNameKey(regionId),
          regionId,
        },
      })

      for (const categoryId of categoriesInRegion) {
        edges.push({
          id: `e-${regionNodeId}-${nodeId('category', categoryId)}`,
          source: regionNodeId,
          target: nodeId('category', categoryId),
          label: 'knowledgeGraph.relation.covers',
          type: 'smoothstep',
          data: { relationKey: 'knowledgeGraph.relation.covers' as KnowledgeGraphRelationKey },
        })
      }
      regionIndex += 1
    }
  }

  return { nodes, edges }
}

export function getCategoryDocumentCount(categoryId: PolicyCategoryId): number {
  return regulationsByCategory(categoryId).length
}

export function getRegulationsForCategory(categoryId: PolicyCategoryId): RegulationItem[] {
  return regulationsByCategory(categoryId)
}

export const KNOWLEDGE_GRAPH_CATEGORY_ORDER = CATEGORY_ORDER

export function getConnectedNodeIds(nodeId: string, edges: Edge<KnowledgeGraphEdgeData>[]): Set<string> {
  const connected = new Set<string>([nodeId])
  for (const edge of edges) {
    if (edge.source === nodeId)
      connected.add(edge.target)
    if (edge.target === nodeId)
      connected.add(edge.source)
  }
  return connected
}
