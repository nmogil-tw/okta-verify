import { useEffect, useRef } from 'react'
import { DemoEvent } from '../types/events'
import RequestsList from './RequestsList'
import ArchitectureDiagram from './ArchitectureDiagram'

interface ApiInspectorPaneProps {
  events: DemoEvent[]
  isConnected: boolean
}

export default function ApiInspectorPane({ events, isConnected }: ApiInspectorPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const latestEvent = events.length > 0 ? events[events.length - 1] : undefined

  // Auto-scroll to latest event
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="h-full flex flex-col animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      <div className="p-8 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              API Activity Monitor
            </h2>
            <p className="text-sm text-neutral-600">
              Live view of all API calls between Okta and Twilio
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-6 scroll-smooth scroll-pt-6">
        {!isConnected && (
          <div className="bg-accent-amber/10 border border-accent-amber/30 rounded-lg p-4 mb-6 animate-slide-in-right">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-accent-amber flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm font-semibold text-accent-amber">
                WebSocket disconnected. Attempting to reconnect...
              </span>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="bg-neutral-100 rounded-full p-8 mb-6">
              <svg
                className="w-20 h-20 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-3">
              Waiting for API Events
            </h3>
            <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
              Start the login process on the left to see API calls appear here in real-time.
              Each event will show the complete request and response data.
            </p>
          </div>
        ) : (
          <>
            <ArchitectureDiagram events={events} latestEvent={latestEvent} />
            <RequestsList events={events} />
          </>
        )}
      </div>
    </div>
  )
}
