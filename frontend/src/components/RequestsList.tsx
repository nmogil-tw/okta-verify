import { useState, useEffect, useRef } from 'react'
import { DemoEvent } from '../types/events'
import RequestDetail from './RequestDetail'

interface RequestsListProps {
  events: DemoEvent[]
}

export default function RequestsList({ events }: RequestsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newEventId, setNewEventId] = useState<string | null>(null)
  const prevEventsLengthRef = useRef(events.length)

  // Detect new events and trigger highlight animation
  useEffect(() => {
    if (events.length > prevEventsLengthRef.current) {
      const latestEvent = events[events.length - 1]
      setNewEventId(latestEvent.id)

      // Remove highlight after animation completes
      const timer = setTimeout(() => {
        setNewEventId(null)
      }, 1000)

      prevEventsLengthRef.current = events.length
      return () => clearTimeout(timer)
    }
    prevEventsLengthRef.current = events.length
  }, [events])

  const getEventBadgeColor = (type: DemoEvent['type']) => {
    switch (type) {
      // Backend events (blue/purple/green)
      case 'telephony_hook':
        return 'bg-okta-blue/10 text-okta-blue border-okta-blue/20'
      case 'verify_api':
        return 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
      case 'event_hook':
        return 'bg-accent-green/10 text-accent-green border-accent-green/20'
      // Frontend events (orange/amber)
      case 'widget_init':
        return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
      case 'oauth_redirect':
        return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
      case 'oauth_callback':
        return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
      case 'token_exchange':
        return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
      case 'auth_success':
        return 'bg-accent-green/10 text-accent-green border-accent-green/20'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const getEventAccentColor = (type: DemoEvent['type']) => {
    switch (type) {
      case 'telephony_hook':
        return 'border-okta-blue'
      case 'verify_api':
        return 'border-accent-purple'
      case 'event_hook':
        return 'border-accent-green'
      case 'widget_init':
        return 'border-accent-amber'
      case 'oauth_redirect':
        return 'border-accent-cyan'
      case 'oauth_callback':
        return 'border-accent-amber'
      case 'token_exchange':
        return 'border-accent-cyan'
      case 'auth_success':
        return 'border-accent-green'
      default:
        return 'border-neutral-300'
    }
  }

  const getEventLabel = (type: DemoEvent['type']) => {
    switch (type) {
      case 'telephony_hook':
        return 'Okta Telephony Hook'
      case 'verify_api':
        return 'Twilio Verify API'
      case 'event_hook':
        return 'Okta Event Hook'
      case 'widget_init':
        return 'Widget Init'
      case 'oauth_redirect':
        return 'OAuth Redirect'
      case 'oauth_callback':
        return 'OAuth Callback'
      case 'token_exchange':
        return 'Token Exchange'
      case 'auth_success':
        return 'Auth Success'
      default:
        return type
    }
  }

  const getEventDescription = (event: DemoEvent) => {
    // Use custom description if available (for frontend events)
    if (event.metadata?.description) {
      return event.metadata.description
    }

    switch (event.type) {
      case 'telephony_hook':
        return `Okta requests SMS verification for ${event.metadata?.phoneNumber || 'user'}`
      case 'verify_api':
        return `Twilio sends ${event.metadata?.channel || 'SMS'} to ${event.metadata?.phoneNumber || 'user'}`
      case 'event_hook':
        return `Okta reports verification ${event.metadata?.status || 'result'}`
      default:
        return 'API Event'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const ms = date.getMilliseconds().toString().padStart(3, '0')
    return `${timeStr}.${ms}`
  }

  return (
    <div className="space-y-3 relative">
      {/* Timeline connector line */}
      {events.length > 1 && (
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-neutral-200" />
      )}

      {events.map((event, index) => (
        <div
          key={event.id}
          className={`relative border border-neutral-200 rounded-xl bg-white shadow-soft hover:shadow-soft-md transition-all duration-300 border-l-4 ${getEventAccentColor(
            event.type
          )} ${newEventId === event.id ? 'animate-highlight-flash' : ''}`}
        >
          <button
            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
            className="w-full p-5 text-left hover:bg-neutral-50/50 rounded-xl transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-sm font-mono font-semibold text-neutral-500 tabular-nums">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${getEventBadgeColor(
                      event.type
                    )}`}
                  >
                    {getEventLabel(event.type)}
                  </span>
                  {/* Source badge */}
                  {event.metadata?.synthetic && (
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-amber/10 text-accent-amber border border-accent-amber/20"
                      title="Generated by frontend for demo visualization"
                    >
                      Frontend
                    </span>
                  )}
                  {!event.metadata?.synthetic && (
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                      title="Real API call captured by backend"
                    >
                      Backend
                    </span>
                  )}
                  <span className="text-xs text-neutral-500 font-mono tabular-nums">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  {event.duration && (
                    <span className="text-xs text-neutral-500 font-mono tabular-nums">
                      <span className="text-neutral-400">⏱</span> {event.duration}ms
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-800 font-semibold mb-2 leading-relaxed">
                  {getEventDescription(event)}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded ${
                      event.request.method === 'GET'
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : 'bg-accent-purple/10 text-accent-purple'
                    }`}
                  >
                    {event.request.method}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="font-mono text-neutral-600 truncate flex-1">
                    {event.request.url}
                  </span>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-neutral-400 transition-transform duration-300 flex-shrink-0 mt-1 ${
                  expandedId === event.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {expandedId === event.id && (
            <div className="border-t border-neutral-200 animate-fade-in-up">
              <RequestDetail event={event} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
