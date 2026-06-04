'use client'

import type { KnowledgeGraphEdgeData, KnowledgeGraphNodeData } from './knowledge-graph-data'
import type { PolicyCategoryId } from './data'
import type { PolicyRegaiKey } from './i18n'
import type { GraphNodeType } from './knowledge-graph-data'
import type { Edge, Node } from 'reactflow'
import { cn } from '@langgenius/dify-ui/cn'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import Link from '@/next/link'
import { basePath } from '@/utils/var'
import {
  buildKnowledgeGraph,
  getCategoryDocumentCount,
  getConnectedNodeIds,
  getRegulationsForCategory,
} from './knowledge-graph-data'
import { categoryNameKey, policyCategoryIds, tp } from './i18n'
import { policyGraphNodeTypes } from './knowledge-graph-node'
import { POLICY_REGAI_ROUTES } from './routes'
import 'reactflow/dist/style.css'

const NODE_TYPE_I18N: Record<GraphNodeType, PolicyRegaiKey> = {
  category: 'knowledgeGraph.node.category',
  policy: 'knowledgeGraph.node.policy',
  agency: 'knowledgeGraph.node.agency',
  entity: 'knowledgeGraph.node.entity',
  material: 'knowledgeGraph.node.material',
  risk: 'knowledgeGraph.node.risk',
  region: 'knowledgeGraph.node.region',
}

const LEGEND_TYPES: GraphNodeType[] = [
  'region',
  'category',
  'policy',
  'agency',
  'entity',
  'material',
  'risk',
]

function KnowledgeGraphCanvas() {
  const { t } = useTranslation()
  const { fitView, setCenter } = useReactFlow()
  const [categoryFilter, setCategoryFilter] = useState<PolicyCategoryId | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showPolicies, setShowPolicies] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<GraphNodeType>>(() => new Set())

  const graph = useMemo(() => buildKnowledgeGraph({
    categoryFilter,
    showPolicies: showPolicies || categoryFilter !== 'all',
    maxPoliciesPerCategory: categoryFilter === 'all' ? 3 : 12,
  }), [categoryFilter, showPolicies])

  const styledGraph = useMemo(() => {
    const connectedIds = selectedNodeId
      ? getConnectedNodeIds(selectedNodeId, graph.edges)
      : null

    const nodes: Node<KnowledgeGraphNodeData>[] = graph.nodes
      .filter(node => !hiddenTypes.has(node.data.graphType))
      .map((node) => {
        const dimmed = connectedIds !== null && !connectedIds.has(node.id)
        return {
          ...node,
          selected: node.id === selectedNodeId,
          data: { ...node.data, dimmed },
        }
      })

    const visibleNodeIds = new Set(nodes.map(node => node.id))
    const edges: Edge<KnowledgeGraphEdgeData>[] = graph.edges
      .filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
      .map((edge) => {
        const highlighted = selectedNodeId !== null
          && (edge.source === selectedNodeId || edge.target === selectedNodeId)
        const dimmed = connectedIds !== null && !highlighted
        return {
          ...edge,
          animated: highlighted,
          style: {
            stroke: highlighted ? '#155EEF' : '#D0D5DD',
            strokeWidth: highlighted ? 2.5 : 1.5,
            opacity: dimmed ? 0.25 : 1,
          },
          labelStyle: {
            fill: highlighted ? '#155EEF' : '#667085',
            fontSize: 11,
            fontWeight: highlighted ? 600 : 400,
          },
          label: edge.data?.relationKey
            ? tp(t, edge.data.relationKey)
            : undefined,
        }
      })

    return { nodes, edges }
  }, [graph, hiddenTypes, selectedNodeId, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [categoryFilter, showPolicies, fitView])

  const selectedNode = useMemo(
    () => graph.nodes.find(node => node.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId],
  )

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node<KnowledgeGraphNodeData>) => {
    setSelectedNodeId(node.id)
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const handleSearchSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    const query = search.trim().toLowerCase()
    if (!query)
      return
    const match = graph.nodes.find((node) => {
      const label = tp(t, node.data.labelKey).toLowerCase()
      return label.includes(query)
    })
    if (!match)
      return
    setSelectedNodeId(match.id)
    setCenter(match.position.x + 90, match.position.y + 30, { zoom: 1.1, duration: 400 })
  }, [graph.nodes, search, setCenter, t])

  const toggleTypeVisibility = useCallback((type: GraphNodeType) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type))
        next.delete(type)
      else
        next.add(type)
      return next
    })
  }, [])

  const relatedDocuments = useMemo(() => {
    if (!selectedNode)
      return []
    if (selectedNode.data.graphType === 'policy')
      return []
    if (selectedNode.data.categoryId)
      return getRegulationsForCategory(selectedNode.data.categoryId)
    return []
  }, [selectedNode])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <form className="flex flex-1 flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={tp(t, 'knowledgeGraph.searchPlaceholder')}
            className="w-full rounded-xl border border-divider-subtle bg-background-default px-4 py-2.5 system-sm-regular text-text-primary outline-none focus:border-primary-600 sm:max-w-md"
          />
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value as PolicyCategoryId | 'all')
              setSelectedNodeId(null)
            }}
            className="rounded-xl border border-divider-subtle bg-background-default px-3 py-2.5 system-sm-regular text-text-primary"
            aria-label={tp(t, 'knowledgeGraph.filterCategory')}
          >
            <option value="all">{tp(t, 'knowledgeGraph.filterAll')}</option>
            {policyCategoryIds().map(categoryId => (
              <option key={categoryId} value={categoryId}>
                {tp(t, categoryNameKey(categoryId))}
                {' '}
                (
                {getCategoryDocumentCount(categoryId)}
                )
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-divider-subtle px-3 py-2.5 system-sm-regular text-text-secondary">
            <input
              type="checkbox"
              checked={showPolicies}
              onChange={event => setShowPolicies(event.target.checked)}
              className="rounded border-divider-subtle"
            />
            {tp(t, 'knowledgeGraph.showPolicies')}
          </label>
        </form>
        <p className="system-xs-regular text-text-tertiary">
          {tp(t, 'knowledgeGraph.interactionHint')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="system-xs-semibold text-text-secondary">{tp(t, 'knowledgeGraph.legend')}</span>
        {LEGEND_TYPES.map((type) => {
          const hidden = hiddenTypes.has(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleTypeVisibility(type)}
              className={cn(
                'rounded-full border px-3 py-1 system-xs-medium transition-opacity',
                hidden
                  ? 'border-divider-subtle bg-background-section text-text-quaternary line-through opacity-60'
                  : 'border-divider-subtle bg-background-default text-text-secondary hover:bg-state-base-hover',
              )}
            >
              {tp(t, NODE_TYPE_I18N[type])}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-[620px] overflow-hidden rounded-2xl border border-divider-subtle bg-background-section">
          <ReactFlow
            nodes={styledGraph.nodes}
            edges={styledGraph.edges}
            nodeTypes={policyGraphNodeTypes}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            fitView
            minZoom={0.25}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="#E4E7EC" />
            <MiniMap
              pannable
              zoomable
              className="!rounded-lg !border !border-divider-subtle !bg-background-default"
            />
            <Controls showInteractive={false} className="!rounded-lg !border !border-divider-subtle !shadow-none" />
          </ReactFlow>
        </div>

        <aside className="rounded-2xl border border-divider-subtle bg-background-default p-5">
          <h2 className="system-md-semibold text-text-primary">
            {tp(t, 'knowledgeGraph.nodeDetail')}
          </h2>
          {!selectedNode
            ? (
                <p className="mt-4 system-sm-regular text-text-tertiary">
                  {tp(t, 'knowledgeGraph.selectNodeHint')}
                </p>
              )
            : (
                <div className="mt-4 space-y-4">
                  <DetailBlock
                    label={tp(t, 'knowledgeGraph.field.type')}
                    value={tp(t, NODE_TYPE_I18N[selectedNode.data.graphType])}
                  />
                  <DetailBlock
                    label={tp(t, 'knowledgeGraph.field.name')}
                    value={tp(t, selectedNode.data.labelKey)}
                  />
                  {selectedNode.data.categoryId && (
                    <DetailBlock
                      label={tp(t, 'knowledgeGraph.field.category')}
                      value={tp(t, categoryNameKey(selectedNode.data.categoryId))}
                    />
                  )}
                  {selectedNode.data.documentCount !== undefined && (
                    <DetailBlock
                      label={tp(t, 'knowledgeGraph.field.documents')}
                      value={String(selectedNode.data.documentCount)}
                    />
                  )}
                  {selectedNode.data.fileUrl && (
                    <div>
                      <div className="system-xs-semibold text-text-tertiary">
                        {tp(t, 'knowledgeGraph.field.source')}
                      </div>
                      <Link
                        href={`${basePath}${selectedNode.data.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block system-sm-medium text-text-accent hover:underline"
                      >
                        {tp(t, 'regulations.openDocument')}
                      </Link>
                    </div>
                  )}
                  {relatedDocuments.length > 0 && (
                    <div>
                      <div className="system-xs-semibold text-text-tertiary">
                        {tp(t, 'knowledgeGraph.relatedDocuments')}
                      </div>
                      <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                        {relatedDocuments.map(doc => (
                          <li key={doc.id}>
                            <Link
                              href={`${basePath}${doc.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="system-xs-regular text-text-accent hover:underline"
                            >
                              {tp(t, doc.titleKey)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link
                    href={POLICY_REGAI_ROUTES.regulations}
                    className="inline-block system-sm-medium text-text-accent hover:underline"
                  >
                    {tp(t, 'knowledgeGraph.openRegulations')}
                  </Link>
                </div>
              )}
        </aside>
      </div>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="system-xs-semibold text-text-tertiary">{label}</div>
      <div className="mt-1 system-sm-regular text-text-primary">{value}</div>
    </div>
  )
}

export function KnowledgeGraphView() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="system-2xl-semibold text-text-primary">
          {tp(t, 'knowledgeGraph.title')}
        </h1>
        <p className="mt-2 system-sm-regular text-text-secondary">
          {tp(t, 'knowledgeGraph.subtitle')}
        </p>
      </div>

      <ReactFlowProvider>
        <KnowledgeGraphCanvas />
      </ReactFlowProvider>
    </div>
  )
}
