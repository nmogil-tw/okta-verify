import express, { Application } from 'express'
import { createServer, Server as HTTPServer } from 'http'
import cors from 'cors'
import { config } from './utils/config.js'
import { logger } from './utils/logger.js'
import { SocketHandler } from './websocket/socketHandler.js'
import healthRouter from './routes/health.js'
import eventsRouter from './routes/events.js'

export class Server {
  private app: Application
  private httpServer: HTTPServer
  private socketHandler: SocketHandler

  constructor() {
    this.app = express()
    this.httpServer = createServer(this.app)
    this.socketHandler = new SocketHandler(this.httpServer)

    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    // CORS
    this.app.use(
      cors({
        origin: config.cors.allowedOrigins,
        credentials: true,
      })
    )

    // JSON body parser
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // Make socket handler available to routes
    this.app.locals.socketHandler = this.socketHandler

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
      })
      next()
    })
  }

  private setupRoutes() {
    // Health check
    this.app.use('/health', healthRouter)

    // Events API
    this.app.use('/api/events', eventsRouter)

    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({ error: 'Not found' })
    })

    // Error handler
    this.app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error('Unhandled error', { error: err.message, stack: err.stack })
      res.status(500).json({ error: 'Internal server error' })
    })
  }

  public start() {
    this.httpServer.listen(config.port, () => {
      logger.info('Server started', {
        port: config.port,
        environment: config.nodeEnv,
        allowedOrigins: config.cors.allowedOrigins,
      })
    })
  }

  public getApp(): Application {
    return this.app
  }

  public getHttpServer(): HTTPServer {
    return this.httpServer
  }

  public getSocketHandler(): SocketHandler {
    return this.socketHandler
  }
}
