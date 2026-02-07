import { DemoEvent, WebhookPayload } from '../types/events.js'
import { logger } from '../utils/logger.js'
import { randomUUID } from 'crypto'

class EventService {
  private eventHistory: DemoEvent[] = []
  private readonly MAX_HISTORY = 100

  /**
   * Process incoming webhook payload and convert to DemoEvent
   */
  processEvent(payload: WebhookPayload): DemoEvent {
    const event: DemoEvent = {
      id: randomUUID(),
      type: payload.type,
      timestamp: payload.timestamp,
      request: payload.request,
      response: payload.response,
      metadata: payload.metadata,
    }

    // Calculate duration if response is present
    if (payload.response && payload.timestamp) {
      const requestTime = new Date(payload.timestamp).getTime()
      const now = Date.now()
      event.duration = now - requestTime
    }

    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift()
    }

    logger.info('Event processed', {
      eventId: event.id,
      type: event.type,
      duration: event.duration,
    })

    return event
  }

  /**
   * Validate webhook payload
   */
  validatePayload(payload: any): payload is WebhookPayload {
    if (!payload) {
      return false
    }

    if (!payload.type || !['telephony_hook', 'verify_api', 'event_hook'].includes(payload.type)) {
      logger.warn('Invalid event type', { type: payload.type })
      return false
    }

    if (!payload.timestamp) {
      logger.warn('Missing timestamp')
      return false
    }

    if (!payload.request || !payload.request.url || !payload.request.method) {
      logger.warn('Invalid request object')
      return false
    }

    return true
  }

  /**
   * Get event history
   */
  getEventHistory(): DemoEvent[] {
    return [...this.eventHistory]
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
    logger.info('Event history cleared')
  }
}

export const eventService = new EventService()
