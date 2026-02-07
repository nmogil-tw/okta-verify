import { Router, Request, Response } from 'express'
import { logger } from '../utils/logger.js'
import { eventService } from '../services/eventService.js'
import { config } from '../utils/config.js'

const router = Router()

/**
 * Webhook endpoint for receiving events from instrumented Twilio Functions
 */
router.post('/capture', (req: Request, res: Response) => {
  try {
    // Validate authentication header
    const demoSecret = req.headers['x-demo-secret']
    if (demoSecret !== config.demo.secret) {
      logger.warn('Unauthorized webhook attempt', {
        ip: req.ip,
        headers: req.headers,
      })
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Validate payload
    if (!eventService.validatePayload(req.body)) {
      logger.warn('Invalid webhook payload', { body: req.body })
      return res.status(400).json({ error: 'Invalid payload' })
    }

    // Process event
    const event = eventService.processEvent(req.body)

    logger.info('Event captured from webhook', {
      eventId: event.id,
      type: event.type,
    })

    // Broadcast via WebSocket (will be set by server.ts)
    if (req.app.locals.socketHandler) {
      req.app.locals.socketHandler.broadcastEvent(event)
    }

    // Return 200 OK to avoid blocking Function execution
    res.status(200).json({
      success: true,
      eventId: event.id,
    })
  } catch (error) {
    logger.error('Error processing webhook', { error })
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Get event history (for debugging)
 */
router.get('/history', (_req: Request, res: Response) => {
  try {
    const history = eventService.getEventHistory()
    res.status(200).json({
      events: history,
      count: history.length,
    })
  } catch (error) {
    logger.error('Error retrieving event history', { error })
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Clear event history (for debugging)
 */
router.delete('/history', (_req: Request, res: Response) => {
  try {
    eventService.clearHistory()
    res.status(200).json({ success: true })
  } catch (error) {
    logger.error('Error clearing event history', { error })
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
