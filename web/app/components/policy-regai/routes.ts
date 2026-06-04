export const POLICY_REGAI_BASE = '/policy-regai'

export const POLICY_REGAI_ROUTES = {
  root: POLICY_REGAI_BASE,
  regulations: `${POLICY_REGAI_BASE}/regulations`,
  analysis: `${POLICY_REGAI_BASE}/analysis`,
  compare: `${POLICY_REGAI_BASE}/compare`,
  knowledgeGraph: `${POLICY_REGAI_BASE}/knowledge-graph`,
  assistant: `${POLICY_REGAI_BASE}/assistant`,
  updates: `${POLICY_REGAI_BASE}/updates`,
} as const

export type PolicyRegaiNavKey = keyof Omit<typeof POLICY_REGAI_ROUTES, 'root'>

export const POLICY_REGAI_NAV_ITEMS: { key: PolicyRegaiNavKey, href: string }[] = [
  { key: 'regulations', href: POLICY_REGAI_ROUTES.regulations },
  { key: 'analysis', href: POLICY_REGAI_ROUTES.analysis },
  { key: 'compare', href: POLICY_REGAI_ROUTES.compare },
  { key: 'knowledgeGraph', href: POLICY_REGAI_ROUTES.knowledgeGraph },
  { key: 'assistant', href: POLICY_REGAI_ROUTES.assistant },
  { key: 'updates', href: POLICY_REGAI_ROUTES.updates },
]
