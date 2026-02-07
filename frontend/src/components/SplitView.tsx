import { useEffect, useRef, useState } from 'react'
import OktaLoginPane, { OktaLoginPaneRef } from './OktaLoginPane'
import ApiInspectorPane from './ApiInspectorPane'
import { DemoEvent } from '../types/events'
import { useEventManager } from '../hooks/useEventManager'

// Animated counter component
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      setDisplayValue(value)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  return (
    <span
      className={`text-xl font-bold text-neutral-900 font-mono tabular-nums transition-all duration-300 ${
        isAnimating ? 'scale-110 text-accent-blue' : 'scale-100'
      }`}
    >
      {displayValue}
    </span>
  )
}

interface SplitViewProps {
  events: DemoEvent[]
  isConnected: boolean
  onReset: () => void
  onEventsChange: (events: DemoEvent[]) => void
  onConnectionChange: (connected: boolean) => void
}

export default function SplitView({
  events,
  isConnected,
  onReset,
  onEventsChange,
  onConnectionChange,
}: SplitViewProps) {
  const { events: allEvents, isConnected: wsConnected, clearAllEvents, addFrontendEvent } = useEventManager()
  const oktaLoginPaneRef = useRef<OktaLoginPaneRef>(null)

  useEffect(() => {
    onEventsChange(allEvents)
  }, [allEvents, onEventsChange])

  useEffect(() => {
    onConnectionChange(wsConnected)
  }, [wsConnected, onConnectionChange])

  const handleClearEvents = () => {
    clearAllEvents()
    onReset()
  }

  const handleReset = async () => {
    console.log('SplitView handleReset called')

    // Trigger Okta logout via the ref
    if (oktaLoginPaneRef.current) {
      console.log('Calling resetWithOktaLogout from SplitView')
      await oktaLoginPaneRef.current.resetWithOktaLogout()
    } else {
      console.log('oktaLoginPaneRef.current is null')
      // If no ref, just clear events and reload
      handleClearEvents()
      window.location.reload()
    }
  }

  const handleExportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `okta-twilio-events-${new Date().toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-8 py-5 shadow-soft animate-slide-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
                Okta BYOT + Twilio Verify
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Visual Integration Demo
              </p>
            </div>
            {/* Brand Badges */}
            <div className="flex items-center gap-2 ml-4">
              <span className="px-3 py-1 bg-okta-blue/10 text-okta-blue text-xs font-semibold rounded-md border border-okta-blue/20">
                Okta
              </span>
              <span className="text-neutral-300">×</span>
              <span className="px-3 py-1 bg-twilio-red/10 text-twilio-red text-xs font-semibold rounded-md border border-twilio-red/20">
                Twilio
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Event Counter */}
            <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-lg border border-neutral-200">
              <span className="text-sm font-medium text-neutral-600">Events</span>
              <AnimatedCounter value={events.length} />
            </div>
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isConnected
                    ? 'bg-accent-green shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse-soft'
                    : 'bg-accent-red'
                }`}
              />
              <span className="text-sm font-medium text-neutral-700">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {/* Export Button */}
            {events.length > 0 && (
              <button
                onClick={handleExportEvents}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 active:scale-95 transition-all duration-200 font-medium text-sm shadow-soft flex items-center gap-2"
                title="Download events as JSON"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )}
            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 active:scale-95 transition-all duration-200 font-medium text-sm shadow-soft-md hover:shadow-soft-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Demo
            </button>
          </div>
        </div>
      </header>

      {/* Split View Content */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-neutral-200 overflow-hidden">
        {/* Left Pane: Okta Login */}
        <div className="overflow-auto bg-neutral-50">
          <OktaLoginPane ref={oktaLoginPaneRef} onReset={handleClearEvents} addFrontendEvent={addFrontendEvent} />
        </div>

        {/* Right Pane: API Inspector */}
        <div className="overflow-auto bg-white">
          <ApiInspectorPane events={events} isConnected={isConnected} />
        </div>
      </div>
    </div>
  )
}
