import { useState } from 'react'
import { DemoEvent } from '../types/events'
import RequestDetail from './RequestDetail'

interface RequestsListProps {
  events: DemoEvent[]
}

export default function RequestsList({ events }: RequestsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getEventBadgeColor = (type: DemoEvent['type']) => {
    switch (type) {
      case 'telephony_hook':
        return 'bg-blue-100 text-blue-800'
      case 'verify_api':
        return 'bg-purple-100 text-purple-800'
      case 'event_hook':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      default:
        return type
    }
  }

  const getEventDescription = (event: DemoEvent) => {
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
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={event.id}
          className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <button
            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
            className="w-full p-4 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-gray-500">
                    #{index + 1}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${getEventBadgeColor(
                      event.type
                    )}`}
                  >
                    {getEventLabel(event.type)}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  {event.duration && (
                    <span className="text-xs text-gray-500">
                      ({event.duration}ms)
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {getEventDescription(event)}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-mono">{event.request.method}</span>
                  <span>•</span>
                  <span className="font-mono truncate">{event.request.url}</span>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
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
            <div className="border-t border-gray-200">
              <RequestDetail event={event} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
