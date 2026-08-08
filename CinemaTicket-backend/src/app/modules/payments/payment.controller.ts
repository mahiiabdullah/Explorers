import { Request, Response } from 'express'
import { createPayment, refundPayment, handlePaymentWebhook, sendOtp, verifyOtp } from './payment.service'
import { sendResponse } from '../../shared/sendResponse'
import AppError from '../../errorHelpers/AppError'

export const createPaymentHandler = async (req: Request, res: Response) => {
  const { bookingId, amount, currency, callbackUrl, returnUrl, idempotencyKey, mockMode, mockForce } = req.body

  // The webhook callback URL must point back at THIS backend. The frontend
  // can supply a returnUrl that the gateway's redirect page will bounce
  // the user to after the webhook fires; if the frontend provides a
  // callbackUrl of its own we honor it (legacy / dev convenience).
  // Per Zero-to-Production rulebook §I, we never use fallbacks that hide
  // missing env vars — fail loud if BACKEND_URL isn't configured.
  const selfUrl = process.env.BACKEND_URL
  if (!selfUrl) {
    throw new AppError(
      500,
      'BACKEND_URL is not configured. Set it to the public URL this backend is reachable at (e.g. http://backend:5000 inside Docker, or the Poridhi LB URL).',
    )
  }
  const finalCallbackUrl =
    callbackUrl ||
    `${selfUrl}/webhooks/payment${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`

  const result = await createPayment({
    bookingId,
    amount,
    currency,
    callbackUrl: finalCallbackUrl,
    idempotencyKey,
    mockMode,
    mockForce,
  })

  sendResponse(res, {
    statusCode: 202,
    success: true,
    message: 'Payment initiated',
    data: result,
  })
}

export const refundPaymentHandler = async (req: Request, res: Response) => {
  const { paymentId, idempotencyKey, mockMode, mockForce } = req.body

  const result = await refundPayment({ paymentId, idempotencyKey, mockMode, mockForce })

  sendResponse(res, {
    statusCode: 202,
    success: true,
    message: 'Refund initiated',
    data: result,
  })
}

export const sendOtpHandler = async (req: Request, res: Response) => {
  const { phone, ref, callbackUrl, idempotencyKey, mockMode, mockForce } = req.body

  const result = await sendOtp({ phone, ref, callbackUrl, idempotencyKey, mockMode, mockForce })

  sendResponse(res, {
    statusCode: 202,
    success: true,
    message: 'OTP send initiated',
    data: result,
  })
}

export const verifyOtpHandler = async (req: Request, res: Response) => {
  const { ref, code } = req.body

  const result = await verifyOtp({ ref, code })

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP verification result',
    data: result,
  })
}

export const paymentWebhookHandler = async (req: Request, res: Response) => {
  try {
    // Express 5 with express.raw() places the Buffer on req.body, not req.rawBody.
    const rawBody = (req as any).rawBody ?? (Buffer.isBuffer(req.body) ? req.body : null)

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ success: false, message: 'Raw body is required for signature verification' })
    }

    const result = await handlePaymentWebhook(rawBody, req.headers as Record<string, string | undefined>)

    res.status(200).json({ success: true, ...result })
  } catch (error: any) {
    if (error instanceof AppError) {
      // callback endpoint must still return 2xx to avoid gateway retry loop
      res.status(200).json({ success: false, message: error.message })
      return
    }

    res.status(200).json({ success: true })
  }
}
