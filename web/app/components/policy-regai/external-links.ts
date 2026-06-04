import type { PolicyRegaiKey } from './i18n'

export type PolicyAuthorityLinkId = 'hnrws' | 'cde'

export type PolicyAuthorityLink = {
  id: PolicyAuthorityLinkId
  href: string
  labelKey: PolicyRegaiKey
  descriptionKey: PolicyRegaiKey
}

/** Official sites — update href here if domains change. */
export const POLICY_AUTHORITY_LINKS: PolicyAuthorityLink[] = [
  {
    id: 'hnrws',
    href: 'https://www.hnrws.cn/',
    labelKey: 'links.hnrws.name',
    descriptionKey: 'links.hnrws.description',
  },
  {
    id: 'cde',
    href: 'https://www.cde.org.cn/',
    labelKey: 'links.cde.name',
    descriptionKey: 'links.cde.description',
  },
]
