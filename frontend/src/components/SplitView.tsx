import { useEffect } from 'react'
import OktaLoginPane from './OktaLoginPane'
import ApiInspectorPane from './ApiInspectorPane'
import { DemoEvent } from '../types/events'
import useWebSocket from '../hooks/useWebSocket'

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
  const { events: wsEvents, isConnected: wsConnected, clearEvents } = useWebSocket()

  useEffect(() => {
    onEventsChange(wsEvents)
  }, [wsEvents, onEventsChange])

  useEffect(() => {
    onConnectionChange(wsConnected)
  }, [wsConnected, onConnectionChange])

  const handleReset = () => {
    clearEvents()
    onReset()
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-okta-blue to-twilio-red text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Okta BYOT + Twilio Verify</h1>
            <p className="text-sm opacity-90">Visual Integration Demo</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </header>

      {/* Split View Content */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-gray-300 overflow-hidden">
        {/* Left Pane: Okta Login */}
        <div className="overflow-auto bg-gray-50">
          <OktaLoginPane onReset={handleReset} />
        </div>

        {/* Right Pane: API Inspector */}
        <div className="overflow-auto bg-white">
          <ApiInspectorPane events={events} isConnected={isConnected} />
        </div>
      </div>
    </div>
  )
}
