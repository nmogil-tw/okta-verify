import { useState, useEffect, useCallback } from 'react'
import useWebSocket from './useWebSocket'
import { DemoEvent } from '../types/events'
import { EventPersistence } from '../utils/eventPersistence'

/**
 * Unified event management combining WebSocket events and frontend events.
 * Handles persistence across OAuth redirects using sessionStorage.
 */
export function useEventManager() {
  const { socket, isConnected, events: wsEvents, clearEvents: clearWsEvents } = useWebSocket()
  const [frontendEvents, setFrontendEvents] = useState<DemoEvent[]>([])
  const [allEvents, setAllEvents] = useState<DemoEvent[]>([])

  // On mount: restore persisted events from sessionStorage
  useEffect(() => {
    const restored = EventPersistence.restore()
    if (restored.length > 0) {
      console.log(`Restored ${restored.length} events from sessionStorage`)
      setFrontendEvents(restored)
    }
  }, [])

  // Merge WebSocket and frontend events, sort by timestamp
  useEffect(() => {
    const merged = [...wsEvents, ...frontendEvents].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    setAllEvents(merged)

    // Persist frontend events for OAuth redirect recovery
    if (frontendEvents.length > 0) {
      EventPersistence.save(frontendEvents)
    }
  }, [wsEvents, frontendEvents])

  /**
   * Add a frontend-generated event
   */
  const addFrontendEvent = useCallback((event: DemoEvent) => {
    console.log('Adding frontend event:', event.type)
    setFrontendEvents(prev => [...prev, event])
  }, [])

  /**
   * Clear all events (both WebSocket and frontend)
   */
  const clearAllEvents = useCallback(() => {
    console.log('Clearing all events')
    clearWsEvents()
    setFrontendEvents([])
    EventPersistence.clear()
  }, [clearWsEvents])

  return {
    socket,
    isConnected,
    events: allEvents,
    addFrontendEvent,
    clearAllEvents
  }
}
