'use client'

import type { KnowledgeGraphNodeData } from './knowledge-graph-data'
import type { PolicyRegaiKey } from './i18n'
import { cn } from '@langgenius/dify-ui/cn'
import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { useTranslation } from 'react-i18next'
import { tp } from './i18n'

const NODE_TYPE_I18N: Record<KnowledgeGraphNodeData['graphType'], PolicyRegaiKey> = {
  category: 'knowledgeGraph.node.category',
  policy: 'knowledgeGraph.node.policy',
  agency: 'knowledgeGraph.node.agency',
  entity: 'knowledgeGraph.node.entity',
  material: 'knowledgeGraph.node.material',
  risk: 'knowledgeGraph.node.risk',
  region: 'knowledgeGraph.node.region',
}

const NODE_TYPE_STYLES: Record<KnowledgeGraphNodeData['graphType'], string> = {
  category: 'border-primary-600 bg-primary-50 shadow-md',
  policy: 'border-primary-300 bg-background-default',
  agency: 'border-orange-300 bg-orange-50',
  entity: 'border-teal-300 bg-teal-50',
  material: 'border-blue-300 bg-blue-50',
  risk: 'border-red-300 bg-red-50',
  region: 'border-divider-deep bg-background-section shadow-sm',
}

const NODE_WIDTH: Record<KnowledgeGraphNodeData['graphType'], string> = {
  category: 'w-[200px]',
  policy: 'w-[180px]',
  agency: 'w-[170px]',
  entity: 'w-[170px]',
  material: 'w-[170px]',
  risk: 'w-[170px]',
  region: 'w-[140px]',
}

export function PolicyKnowledgeGraphNode({ data, selected }: NodeProps<KnowledgeGraphNodeData>) {
  const { t } = useTranslation()
  const label = tp(t, data.labelKey)
  const truncated = label.length > 42 ? `${label.slice(0, 42)}…` : label

  return (
    <div
      className={cn(
        'rounded-xl border-2 px-3 py-2 transition-opacity',
        NODE_TYPE_STYLES[data.graphType],
        NODE_WIDTH[data.graphType],
        selected && 'ring-2 ring-primary-600 ring-offset-2',
        data.dimmed && 'opacity-35',
      )}
      title={label}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-none !bg-primary-400" />
      <div className="system-2xs-semibold uppercase tracking-wide text-text-tertiary">
        {tp(t, NODE_TYPE_I18N[data.graphType])}
      </div>
      <div className="mt-1 system-xs-medium leading-snug text-text-primary">
        {truncated}
      </div>
      {data.graphType === 'category' && data.documentCount !== undefined && (
        <div className="mt-1 system-2xs-regular text-text-tertiary">
          {tp(t, 'knowledgeGraph.documentBadge', { count: data.documentCount })}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-none !bg-primary-400" />
    </div>
  )
}

export const policyGraphNodeTypes = {
  policyGraph: PolicyKnowledgeGraphNode,
}
