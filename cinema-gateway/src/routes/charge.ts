import { Router, Request, Response } from 'express';
import { fireCallback, generateId } from '../lib/callback.js';

const router = Router();

/** Choose a terminal status from X-Mock-Force; default SUCCEEDED. */
const resolveFinalStatus = (req: Request): 'SUCCEEDED' | 'FAILED' | 'REFUNDED' => {
  const force = (req.headers['x-mock-force'] || '').toString().toUpperCase();
  if (force === 'FAILED' || force === 'REFUNDED') return force;
  return 'SUCCEEDED';
};

/**
 * POST /charge
 * Body: { amount, currency, booking_ref, callback_url }
 * Headers (optional):
 *   X-Mock-Mode  — for documentation only; gateway is always in mock mode.
 *   X-Mock-Force — SUCCEEDED (default) | FAILED | REFUNDED to override the
 *                  terminal status of the webhook. Useful for testing.
 *
 * Returns 202 immediately with a redirect URL; fires the HMAC-signed
 * webhook callback 3 seconds later.
 */
router.post('/charge', (req: Request, res: Response) => {
  const { amount, currency, booking_ref, callback_url } = req.body ?? {};

  if (
    typeof amount !== 'number' ||
    typeof currency !== 'string' ||
    typeof booking_ref !== 'string' ||
    typeof callback_url !== 'string'
  ) {
    res.status(400).json({ success: false, message: 'amount (number), currency, booking_ref, callback_url are required' });
    return;
  }

  const paymentId = generateId('pay');
  const secret = process.env.GATEWAY_SECRET || 'z2p-2026-secret';
  const finalStatus = resolveFinalStatus(req);

  // The redirect page is served by this gateway; users bounce back from here.
  // `GATEWAY_PUBLIC_URL` lets Docker deployments override the host that
  // appears in the URL (otherwise we fall back to localhost).
  const publicHost = process.env.GATEWAY_PUBLIC_URL || `http://localhost:${process.env.PORT || 9000}`;
  const redirectUrl = `${publicHost}/redirect?payment_id=${paymentId}&booking_ref=${booking_ref}`;

  console.log(
    `[gateway] /charge accepted → payment_id=${paymentId}, booking=${booking_ref}, amount=${amount} ${currency}, forced=${finalStatus}`,
  );

  res.status(202).json({
    success: true,
    payment_id: paymentId,
    redirect_url: redirectUrl,
    status: 'PENDING',
  });

  // Webhook fires asynchronously — gateway behaviour per the reference PDF.
  setTimeout(() => {
    const payload = {
      event_id: generateId('evt'),
      payment_id: paymentId,
      booking_ref,
      status: finalStatus,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    };
    fireCallback(callback_url, payload, secret);
  }, 3000);
});

export default router;