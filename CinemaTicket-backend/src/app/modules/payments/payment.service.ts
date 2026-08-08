import { createHmac } from 'crypto'
import { prisma } from '../../lib/prisma'
import AppError from '../../errorHelpers/AppError'
import { confirmBooking } from '../bookings/booking.service'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:9000'
const GATEWAY_SECRET = process.env.GATEWAY_SECRET || 'z2p-2026-secret'

interface CreatePaymentParams {
  bookingId: string
  amount: number
  currency: string
  callbackUrl: string
  idempotencyKey?: string
  mockMode?: string
  mockForce?: string
}

interface RefundPaymentParams {
  paymentId: string
  idempotencyKey?: string
  mockMode?: string
  mockForce?: string
}

interface OtpSendParams {
  phone: string
  ref: string
  callbackUrl: string
  idempotencyKey?: string
  mockMode?: string
  mockForce?: string
}

interface OtpVerifyParams {
  ref: string
  code: string
}

interface GatewayPaymentCallbackPayload {
  event_id: string
  payment_id: string
  booking_ref: string
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
  amount: number
  currency: string
  timestamp: string
}

const mapGatewayStatusToPaymentStatus = (status: string) => {
  switch (status) {
    case 'SUCCEEDED':
      return 'SUCCEEDED'
    case 'FAILED':
      return 'FAILED'
    case 'REFUNDED':
      return 'REFUNDED'
    default:
      return 'PENDING'
  }
}

const verifySignature = (rawBody: Buffer, signature?: string | null) => {
  if (!signature) return false
  const expected = createHmac('sha256', GATEWAY_SECRET)
    .update(rawBody)
    .digest('hex')

  return expected === signature
}

export const createPayment = async ({
  bookingId,
  amount,
  currency,
  callbackUrl,
  idempotencyKey,
  mockMode,
  mockForce,
}: CreatePaymentParams) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  })

  if (!booking) {
    throw new AppError(404, 'Booking not found')
  }

  if (!['HELD', 'AWAITING_PAYMENT'].includes(booking.status)) {
    throw new AppError(409, 'Booking is not eligible for payment')
  }

  if (booking.payment && ['PENDING', 'SUCCEEDED'].includes(booking.payment.status)) {
    return {
      payment: booking.payment,
      gatewayResponse: {
        payment_id: booking.payment.gatewayPaymentId,
        status: booking.payment.status,
        duplicate: true,
      },
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  }
  if (mockMode) headers['X-Mock-Mode'] = mockMode
  if (mockForce) headers['X-Mock-Force'] = mockForce

  const response = await fetch(`${GATEWAY_URL}/charge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount,
      currency,
      booking_ref: bookingId,
      callback_url: callbackUrl,
    }),
  })

  if (response.status !== 202) {
    const body = await response.text()
    throw new AppError(response.status, `Gateway charge failed: ${body}`)
  }

  const gatewayResult = await response.json()

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      gatewayPaymentId: gatewayResult.payment_id,
      amount,
      status: 'PENDING',
    },
    update: {
      gatewayPaymentId: gatewayResult.payment_id,
      amount,
      status: 'PENDING',
    },
  })

  if (booking.status === 'HELD') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'AWAITING_PAYMENT' },
    })
  }

  return {
    payment,
    gatewayResponse: gatewayResult,
  }
}

export const refundPayment = async ({ paymentId, idempotencyKey, mockMode, mockForce }: RefundPaymentParams) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  })

  if (!payment) {
    throw new AppError(404, 'Payment not found')
  }

  if (payment.status !== 'SUCCEEDED') {
    throw new AppError(409, 'Only succeeded payments can be refunded')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  }
  if (mockMode) headers['X-Mock-Mode'] = mockMode
  if (mockForce) headers['X-Mock-Force'] = mockForce

  const response = await fetch(`${GATEWAY_URL}/refund`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ payment_id: payment.gatewayPaymentId }),
  })

  if (response.status !== 202) {
    const body = await response.text()
    throw new AppError(response.status, `Gateway refund failed: ${body}`)
  }

  return { payment, gatewayResponse: await response.json() }
}

export const sendOtp = async ({ phone, ref, callbackUrl, idempotencyKey, mockMode, mockForce }: OtpSendParams) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  }
  if (mockMode) headers['X-Mock-Mode'] = mockMode
  if (mockForce) headers['X-Mock-Force'] = mockForce

  const response = await fetch(`${GATEWAY_URL}/otp/send`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, ref, callback_url: callbackUrl }),
  })

  if (response.status !== 202) {
    const body = await response.text()
    throw new AppError(response.status, `Gateway OTP send failed: ${body}`)
  }

  return { gatewayResponse: await response.json() }
}

export const verifyOtp = async ({ ref, code }: OtpVerifyParams) => {
  const response = await fetch(`${GATEWAY_URL}/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref, code }),
  })

  if (response.status !== 200) {
    const body = await response.text()
    throw new AppError(response.status, `Gateway OTP verify failed: ${body}`)
  }

  return await response.json()
}

const releaseBookingHeldSeats = async (tx: any, bookingId: string) => {
  await tx.showSeat.updateMany({
    where: {
      bookingId,
      status: 'HELD',
    },
    data: {
      status: 'AVAILABLE',
      bookingId: null,
      holdExpiresAt: null,
    },
  })

  await tx.booking.update({
    where: { id: bookingId },
    data: { status: 'FAILED' },
  })
}

const cancelBookingSeats = async (tx: any, bookingId: string) => {
  await tx.showSeat.updateMany({
    where: {
      bookingId,
      status: 'BOOKED',
    },
    data: {
      status: 'AVAILABLE',
      bookingId: null,
      holdExpiresAt: null,
    },
  })

  await tx.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  })
}

export const handlePaymentWebhook = async (rawBody: Buffer, headers: Record<string, string | undefined>) => {
  const signature = headers['x-signature'] || headers['X-Signature']
  if (!verifySignature(rawBody, signature)) {
    throw new AppError(401, 'Invalid signature')
  }

  const payload = JSON.parse(rawBody.toString()) as GatewayPaymentCallbackPayload
  const { event_id, payment_id, booking_ref, status, amount, currency, timestamp } = payload

  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { eventId: event_id },
  })

  if (existingEvent) {
    return { duplicate: true }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: booking_ref },
    include: { payment: true },
  })

  let payment = null
  if (booking) {
    payment = await prisma.payment.upsert({
      where: { bookingId: booking_ref },
      create: {
        bookingId: booking_ref,
        gatewayPaymentId: payment_id,
        amount,
        status: mapGatewayStatusToPaymentStatus(status),
      },
      update: {
        gatewayPaymentId: payment_id,
        amount,
        status: mapGatewayStatusToPaymentStatus(status),
      },
    })
  }

  await prisma.paymentEvent.create({
    data: {
      eventId: event_id,
      paymentId: payment?.id ?? '',
      status,
      amount,
      receivedAt: new Date(timestamp),
    },
  })

  if (!booking) {
    return { handled: true }
  }

  if (status === 'SUCCEEDED') {
    await confirmBooking({ bookingId: booking_ref })
  } else if (status === 'FAILED') {
    await prisma.$transaction(async (tx) => {
      await releaseBookingHeldSeats(tx, booking_ref)
    })
  } else if (status === 'REFUNDED') {
    await prisma.$transaction(async (tx) => {
      await cancelBookingSeats(tx, booking_ref)
    })
  }

  return { handled: true }
}
