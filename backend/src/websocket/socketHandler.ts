import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { logger } from '../utils/logger.js'
import { config } from '../utils/config.js'
import { DemoEvent } from '../types/events.js'

export class SocketHandler {
  private io: SocketIOServer

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.cors.allowedOrigins,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Client connected', { socketId: socket.id })

      socket.on('disconnect', () => {
        logger.info('Client disconnected', { socketId: socket.id })
      })

      socket.on('error', (error) => {
        logger.error('Socket error', { socketId: socket.id, error })
      })
    })
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastEvent(event: DemoEvent) {
    this.io.emit('api-event', event)
    logger.info('Event broadcasted', {
      eventId: event.id,
      type: event.type,
      connectedClients: this.io.engine.clientsCount,
    })
  }

  /**
   * Get number of connected clients
   */
  getConnectedClients(): number {
    return this.io.engine.clientsCount
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer {
    return this.io
  }
}
