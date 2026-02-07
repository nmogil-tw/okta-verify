import { DemoEvent } from '../types/events'

const STORAGE_KEY = 'okta-demo-events'

/**
 * Manages event persistence across OAuth redirects using sessionStorage.
 * Events are stored when navigating away and restored on return.
 */
export const EventPersistence = {
  /**
   * Save events to sessionStorage
   */
  save(events: DemoEvent[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (error) {
      console.warn('Failed to save events to sessionStorage:', error)
    }
  },

  /**
   * Restore events from sessionStorage
   */
  restore(): DemoEvent[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to restore events from sessionStorage:', error)
      return []
    }
  },

  /**
   * Clear all stored events
   */
  clear(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear events from sessionStorage:', error)
    }
  }
}
