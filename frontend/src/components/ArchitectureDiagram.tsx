import { useEffect, useState } from 'react'
import { DemoEvent } from '../types/events'

interface ArchitectureDiagramProps {
  events: DemoEvent[]
  latestEvent?: DemoEvent
}

export default function ArchitectureDiagram({ latestEvent }: ArchitectureDiagramProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [pulseActive, setPulseActive] = useState(false)

  useEffect(() => {
    if (!latestEvent) return

    // Map event types to nodes
    let node: string | null = null
    if (latestEvent.type === 'widget_init' || latestEvent.type === 'oauth_redirect' || latestEvent.type === 'oauth_callback') {
      node = 'user'
    } else if (latestEvent.type === 'telephony_hook' || latestEvent.type === 'event_hook' || latestEvent.type === 'token_exchange') {
      node = 'okta'
    } else if (latestEvent.type === 'verify_api') {
      node = 'twilio'
    }

    if (node) {
      setActiveNode(node)
      setPulseActive(true)

      // Reset after animation
      const timer = setTimeout(() => {
        setPulseActive(false)
        setActiveNode(null)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [latestEvent])

  const nodes = [
    { id: 'user', label: 'User', color: 'neutral', tooltip: 'User initiates login and receives SMS' },
    { id: 'okta', label: 'Okta', color: 'okta', tooltip: 'Okta authentication with BYOT (Bring Your Own Telephony)' },
    { id: 'twilio', label: 'Twilio Function', color: 'twilio', tooltip: 'Serverless function handling Okta telephony hooks' },
    { id: 'verify', label: 'Twilio Verify', color: 'twilio', tooltip: 'Twilio Verify API for SMS OTP delivery' },
    { id: 'sms', label: 'SMS Device', color: 'neutral', tooltip: 'User\'s mobile phone receiving verification code' },
  ]

  return (
    <div className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-1">Architecture Flow</h3>
        <p className="text-sm text-neutral-600">Live visualization of authentication requests</p>
      </div>

      {/* Diagram Container */}
      <div className="relative py-6">
        {/* Nodes Container */}
        <div className="flex items-center justify-between mb-6">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center" style={{ flex: index === nodes.length - 1 ? '0 0 auto' : '1 1 0%' }}>
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 border-2 cursor-help ${
                    activeNode === node.id
                      ? node.color === 'okta'
                        ? 'bg-okta-blue/10 border-okta-blue shadow-[0_0_20px_rgba(0,125,193,0.3)]'
                        : node.color === 'twilio'
                        ? 'bg-twilio-red/10 border-twilio-red shadow-[0_0_20px_rgba(242,47,70,0.3)]'
                        : 'bg-neutral-100 border-neutral-400 shadow-soft-md'
                      : 'bg-white border-neutral-200 shadow-soft hover:shadow-soft-md'
                  }`}
                  title={node.tooltip}
                >
                  {/* Icon SVGs */}
                  {node.id === 'user' && (
                    <svg className="w-8 h-8 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                  {node.id === 'okta' && (
                    <svg className="w-8 h-8 text-okta-blue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                    </svg>
                  )}
                  {node.id === 'twilio' && (
                    <svg className="w-8 h-8 text-accent-amber" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                    </svg>
                  )}
                  {node.id === 'verify' && (
                    <svg className="w-8 h-8 text-twilio-red" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                    </svg>
                  )}
                  {node.id === 'sms' && (
                    <svg className="w-8 h-8 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-1-6h-3V8h-2v5H8l4 4 4-4z" />
                    </svg>
                  )}
                </div>
                <span
                  className={`mt-3 text-xs font-semibold transition-colors duration-300 text-center whitespace-nowrap ${
                    activeNode === node.id
                      ? node.color === 'okta'
                        ? 'text-okta-blue'
                        : node.color === 'twilio'
                        ? 'text-twilio-red'
                        : 'text-neutral-900'
                      : 'text-neutral-700'
                  }`}
                >
                  {node.label}
                </span>
              </div>

              {/* Arrow (except after last node) */}
              {index < nodes.length - 1 && (
                <div className="flex items-center justify-center px-3 -mt-8">
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none" className="flex-shrink-0">
                    {pulseActive && (
                      <line
                        x1="0"
                        y1="8"
                        x2="40"
                        y2="8"
                        stroke="#0066ff"
                        strokeWidth="2"
                        opacity="0.3"
                        className="animate-pulse"
                      />
                    )}
                    <line x1="0" y1="8" x2="33" y2="8" stroke="#9ca3af" strokeWidth="2" />
                    <path d="M33 8L28 5.5L28 10.5L33 8Z" fill="#9ca3af" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-neutral-200 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-okta-blue"></div>
          <span className="text-xs text-neutral-700 font-medium">Okta Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-twilio-red"></div>
          <span className="text-xs text-neutral-700 font-medium">Twilio Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-500"></div>
          <span className="text-xs text-neutral-700 font-medium">User Events</span>
        </div>
      </div>
    </div>
  )
}
