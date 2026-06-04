import { POLICY_REGAI_ROUTES } from '@/app/components/policy-regai/routes'
import { redirect } from '@/next/navigation'

export default function PolicyRegaiIndexPage() {
  redirect(POLICY_REGAI_ROUTES.compare)
}
