import { createHmac } from 'crypto';

export function signBody(rawBody: string | Buffer, secret: string): string {
  const body = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  return createHmac('sha256', secret).update(body).digest('hex');
}