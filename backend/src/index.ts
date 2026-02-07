import { Server } from './server.js'
import { logger } from './utils/logger.js'

const server = new Server()

// Start server
server.start()

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.getHttpServer().close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  server.getHttpServer().close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})
