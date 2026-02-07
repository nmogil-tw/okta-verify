import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { DemoEvent } from '../types/events'

export default function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<DemoEvent[]>([])

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    const socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('api-event', (event: DemoEvent) => {
      console.log('Received event:', event)
      setEvents((prevEvents) => [...prevEvents, event])
    })

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return {
    socket,
    isConnected,
    events,
    clearEvents,
  }
}
