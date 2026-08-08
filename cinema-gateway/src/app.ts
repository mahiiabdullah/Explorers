import express, { Application } from 'express';
import cors from 'cors';
import chargeRoutes from './routes/charge.js';
import refundRoutes from './routes/refund.js';
import otpRoutes from './routes/otp.js';
import redirectRoutes from './routes/redirect.js';

const app: Application = express();

// Permissive CORS — the gateway is a dev-only mock.
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use(chargeRoutes);
app.use(refundRoutes);
app.use('/otp', otpRoutes);
app.use(redirectRoutes);

app.get('/', (_req, res) => {
  res.json({ success: true, service: 'cinema-gateway', version: '1.0.0' });
});

export default app;