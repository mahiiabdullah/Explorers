import { Router, Request, Response } from 'express';
import { fireCallback, generateId } from '../lib/callback.js';

const router = Router();

/**
 * Per CinemaSeat_Gateway_Reference.pdf, OTP behaviour is:
 *   POST /otp/send   — accepts { phone, ref, callback_url }, returns 202
 *                       with { otp_ref, status: 'PENDING', delivery: 'mock' }.
 *                       Fires the callback 1 second later with the code that
 *                       the merchant should display (mock: never via SMS).
 *   POST /otp/verify — accepts { ref, code }, returns 200 with
 *                       { ref, status: 'VERIFIED' | 'FAILED', attempts }.
 *
 * The mock code is fixed: 123456. X-Mock-Force=FAILED makes verify return FAILED.
 *
 * The backend calls `${GATEWAY_URL}/otp/send` and `/otp/verify`, so we mount
 * this router on the `/otp` prefix in app.ts and define the handlers here
 * without a further prefix.
 */

const MOCK_CODE = '123456';
const otpStore = new Map<string, { code: string; attempts: number; createdAt: number }>();

/** Periodic GC so dev usage doesn't leak forever. */
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [k, v] of otpStore) {
    if (v.createdAt < cutoff) otpStore.delete(k);
  }
}, 60_000).unref?.();

router.post('/send', (req: Request, res: Response) => {
  const { phone, ref, callback_url } = req.body ?? {};

  if (typeof phone !== 'string' || typeof ref !== 'string') {
    res.status(400).json({ success: false, message: 'phone and ref are required' });
    return;
  }

  const otpRef = generateId('otp');
  const secret = process.env.GATEWAY_SECRET || 'z2p-2026-secret';

  otpStore.set(otpRef, { code: MOCK_CODE, attempts: 0, createdAt: Date.now() });

  console.log(`[gateway] /otp/send accepted → otp_ref=${otpRef}, phone=${phone}, ref=${ref}`);

  res.status(202).json({
    success: true,
    otp_ref: otpRef,
    delivery: 'mock',
    status: 'PENDING',
  });

  if (typeof callback_url === 'string') {
    setTimeout(() => {
      fireCallback(
        callback_url,
        {
          event_id: generateId('evt'),
          ref,
          otp_ref: otpRef,
          code: MOCK_CODE,
          status: 'DELIVERED' as const,
          timestamp: new Date().toISOString(),
        },
        secret,
      );
    }, 1000);
  }
});

router.post('/verify', (req: Request, res: Response) => {
  const { ref, code } = req.body ?? {};

  if (typeof ref !== 'string' || typeof code !== 'string') {
    res.status(400).json({ success: false, message: 'ref and code are required' });
    return;
  }

  const record = otpStore.get(ref);
  const force = (req.headers['x-mock-force'] || '').toString().toUpperCase();

  if (!record) {
    res.status(200).json({ success: false, ref, status: 'FAILED', attempts: 0, message: 'OTP ref not found' });
    return;
  }

  record.attempts += 1;

  if (force === 'FAILED' || code !== record.code) {
    res.status(200).json({ success: false, ref, status: 'FAILED', attempts: record.attempts });
    return;
  }

  otpStore.delete(ref);
  res.status(200).json({ success: true, ref, status: 'VERIFIED', attempts: record.attempts });
});

export default router;