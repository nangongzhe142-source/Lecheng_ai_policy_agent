import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Lecheng Policy Intelligence Service',
    template: '%s | Lecheng Policy Intelligence Service',
  },
  description: 'Boao Lecheng policy intelligence platform for regulations, comparison, and AI-assisted analysis.',
  icons: {
    icon: '/policy-regai/favicon.svg',
    apple: '/policy-regai/favicon.svg',
  },
  appleWebApp: {
    title: 'Lecheng Policy',
  },
}

export default function PolicyRegaiRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
