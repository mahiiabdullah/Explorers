import { Router, Request, Response } from 'express';
import { fireCallback, generateId } from '../lib/callback.js';

const router = Router();

/**
 * POST /refund
 * Body: { payment_id, callback_url? }
 * Returns 202; fires the callback 2 seconds later.
 */
router.post('/refund', (req: Request, res: Response) => {
  const { payment_id, callback_url } = req.body ?? {};

  if (typeof payment_id !== 'string') {
    res.status(400).json({ success: false, message: 'payment_id is required' });
    return;
  }

  const refundId = generateId('rfd');
  const secret = process.env.GATEWAY_SECRET || 'z2p-2026-secret';

  console.log(`[gateway] /refund accepted → refund_id=${refundId}, payment=${payment_id}`);

  res.status(202).json({
    success: true,
    refund_id: refundId,
    payment_id,
    status: 'PENDING',
  });

  if (typeof callback_url === 'string') {
    setTimeout(() => {
      const payload = {
        event_id: generateId('evt'),
        payment_id,
        booking_ref: '',
        status: 'REFUNDED' as const,
        amount: 0,
        currency: 'INR',
        timestamp: new Date().toISOString(),
      };
      fireCallback(callback_url, payload, secret);
    }, 2000);
  }
});

export default router;