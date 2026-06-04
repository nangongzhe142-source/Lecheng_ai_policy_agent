'use client'

import { useFavicon, useTitle } from 'ahooks'
import { useTranslation } from 'react-i18next'
import { basePath } from '@/utils/var'
import { tp } from './i18n'

export function usePolicyRegaiDocumentTitle(pageTitleKey?: Parameters<typeof tp>[1]) {
  const { t } = useTranslation()
  const brand = tp(t, 'brand.title')
  const pageTitle = pageTitleKey ? tp(t, pageTitleKey) : ''
  useTitle(pageTitle ? `${pageTitle} | ${brand}` : brand)
  useFavicon(`${basePath}/policy-regai/favicon.svg`)
}
