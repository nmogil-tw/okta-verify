import { useEffect, useRef } from 'react'
import { DemoEvent } from '../types/events'
import RequestsList from './RequestsList'

interface ApiInspectorPaneProps {
  events: DemoEvent[]
  isConnected: boolean
}

export default function ApiInspectorPane({ events, isConnected }: ApiInspectorPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest event
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              API Activity Monitor
            </h2>
            <p className="text-sm text-gray-600">
              Live view of all API calls between Okta and Twilio
            </p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Events:</span>
            <span className="ml-2 text-lg font-bold text-gray-800">{events.length}</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-6">
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600"
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
              <span className="text-sm font-medium text-yellow-800">
                WebSocket disconnected. Attempting to reconnect...
              </span>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
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
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Waiting for API Events
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Start the login process on the left to see API calls appear here in real-time
            </p>
          </div>
        ) : (
          <RequestsList events={events} />
        )}
      </div>
    </div>
  )
}
