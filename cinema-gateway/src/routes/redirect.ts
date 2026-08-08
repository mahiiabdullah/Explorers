import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /redirect
 * Simple "payment success" page. The backend already received a webhook by the
 * time the user lands here, so we just tell them they're done and link them
 * back to the frontend's confirmation page.
 */
router.get('/redirect', (req: Request, res: Response) => {
  const { payment_id, booking_ref, app_url, return: returnParam } = req.query as Record<string, string | undefined>;
  const returnUrl =
    returnParam ||
    (app_url
      ? `${app_url}/booking/${booking_ref}/confirmed?payment_id=${payment_id}`
      : `http://localhost:3006/booking/${booking_ref}/confirmed?payment_id=${payment_id}`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Payment successful · Z2P Gateway</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #fafafa; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { max-width: 420px; width: 100%; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; text-align: center; }
    .check { width: 56px; height: 56px; border-radius: 50%; background: #f59e0b; color: #0a0a0a; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; font-weight: 800; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    p { color: #a1a1aa; font-size: 14px; margin: 8px 0; }
    .meta { background: #0a0a0a; border-radius: 8px; padding: 12px; margin: 16px 0; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; color: #71717a; word-break: break-all; }
    a { display: inline-block; background: #f59e0b; color: #0a0a0a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">✓</div>
    <h1>Payment successful</h1>
    <p>Your payment has been processed and the booking is confirmed.</p>
    <div class="meta">
      <div>payment_id: <strong>${payment_id ?? 'n/a'}</strong></div>
      <div>booking_ref: <strong>${booking_ref ?? 'n/a'}</strong></div>
    </div>
    <p>Returning to your booking in 2 seconds…</p>
    <a href="${returnUrl}">Continue now</a>
  </div>
  <script>
    setTimeout(function(){ window.location.href = ${JSON.stringify(returnUrl)}; }, 2000);
  </script>
</body>
</html>`);
});

export default router;