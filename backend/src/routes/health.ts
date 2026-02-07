import { Router, Request, Response } from 'express'
import { logger } from '../utils/logger.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  }

  logger.debug('Health check requested', health)

  res.status(200).json(health)
})

export default router
