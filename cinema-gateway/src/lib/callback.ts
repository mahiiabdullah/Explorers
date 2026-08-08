import { signBody } from './sign.js';

export interface CallbackPayload {
  event_id: string;
  payment_id: string;
  booking_ref: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  timestamp: string;
}

export async function fireCallback(callbackUrl: string, payload: CallbackPayload, secret: string): Promise<void> {
  const body = JSON.stringify(payload);
  const signature = signBody(body, secret);

  try {
    const res = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
      body,
    });
    console.log(`[gateway] callback fired → ${callbackUrl} (${res.status})`);
  } catch (err) {
    console.error('[gateway] callback failed', err);
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}