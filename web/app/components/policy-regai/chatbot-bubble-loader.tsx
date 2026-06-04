'use client'

import { useEffect, useRef } from 'react'
import { getPolicyAgentConfig, getPolicyAgentEmbedScriptUrl } from '@/config/policy-agent'
import Script from '@/next/script'
import { basePath } from '@/utils/var'

const BUBBLE_STYLE_ID = 'policy-regai-chatbot-bubble-style'

type DifyChatbotWindow = typeof window & {
  difyChatbotConfig?: {
    token: string
    baseUrl?: string
    isDev?: boolean
    inputs?: Record<string, string>
    systemVariables?: Record<string, string>
    userVariables?: Record<string, string>
  }
}

export function PolicyRegaiBubbleLoader() {
  const injectedRef = useRef(false)
  const { enableBubble, token, baseUrl } = getPolicyAgentConfig()
  const embedScriptUrl = getPolicyAgentEmbedScriptUrl(basePath)

  useEffect(() => {
    if (!enableBubble || !token || !baseUrl || injectedRef.current)
      return

    const chatbotWindow = window as DifyChatbotWindow
    chatbotWindow.difyChatbotConfig = {
      token,
      baseUrl: `${baseUrl}${basePath}`,
      inputs: {},
      systemVariables: {},
      userVariables: {},
    }

    if (!document.getElementById(BUBBLE_STYLE_ID)) {
      const style = document.createElement('style')
      style.id = BUBBLE_STYLE_ID
      style.textContent = `
        #dify-chatbot-bubble-button {
          background-color: #1C64F2 !important;
        }
        #dify-chatbot-bubble-window {
          width: 24rem !important;
          height: 40rem !important;
        }
      `
      document.head.appendChild(style)
    }

    injectedRef.current = true
  }, [baseUrl, enableBubble, token])

  if (!enableBubble || !token || !baseUrl || !embedScriptUrl)
    return null

  return (
    <Script
      id={`policy-regai-embed-${token}`}
      src={embedScriptUrl}
      strategy="afterInteractive"
    />
  )
}
