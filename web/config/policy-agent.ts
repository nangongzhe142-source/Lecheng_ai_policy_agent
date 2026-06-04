import { env } from '@/env'

export type PolicyAgentConfig = {
  baseUrl: string
  token: string
  enableBubble: boolean
}

export function getPolicyAgentConfig(): PolicyAgentConfig {
  return {
    baseUrl: env.NEXT_PUBLIC_POLICY_AGENT_BASE_URL ?? '',
    token: env.NEXT_PUBLIC_POLICY_AGENT_TOKEN ?? '',
    enableBubble: env.NEXT_PUBLIC_POLICY_AGENT_ENABLE_BUBBLE,
  }
}

export function getPolicyAgentChatbotUrl(basePath: string): string | null {
  const { baseUrl, token } = getPolicyAgentConfig()
  if (!baseUrl || !token)
    return null
  return `${baseUrl}${basePath}/chatbot/${token}`
}

export function getPolicyAgentEmbedScriptUrl(basePath: string): string | null {
  const { baseUrl } = getPolicyAgentConfig()
  if (!baseUrl)
    return null
  return `${baseUrl}${basePath}/embed.min.js`
}
