import express, { Application } from 'express'
import { IndexRoutes } from './app/routes'
import cors from 'cors'
import { paymentWebhookHandler } from './app/modules/payments/payment.controller'

const app: Application = express()

// Behind a load balancer (Poridhi / nginx / Cloudflare). Honour
// X-Forwarded-* so req.ip, req.protocol and rate-limiters see the real client.
app.set('trust proxy', 1)

const allowedOrigins = [
  // The public frontend URL — Poridhi LB in production, localhost in dev.
  process.env.FRONTEND_URL,
  // Local-dev conveniences — kept so the same image works on a laptop too.
  'http://localhost:3006',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:9000',
].filter((v): v is string => typeof v === 'string' && v.length > 0)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Signature', 'Idempotency-Key'],
  })
)

app.use(express.urlencoded({ extended: true }))

app.post('/webhooks/payment', express.raw({ type: 'application/json' }), paymentWebhookHandler)

app.use(express.json())

app.use('/api/v1', IndexRoutes)

app.get('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Hello World',
  })
})

export default app

