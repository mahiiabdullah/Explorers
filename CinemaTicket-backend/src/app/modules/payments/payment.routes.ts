import express from 'express'
import { catchAsync } from '../../shared/cathAsync'
import {
  createPaymentHandler,
  refundPaymentHandler,
  sendOtpHandler,
  verifyOtpHandler,
  paymentWebhookHandler,
} from './payment.controller'

const router = express.Router()

router.post('/charge', catchAsync(createPaymentHandler))
router.post('/refund', catchAsync(refundPaymentHandler))
router.post('/otp/send', catchAsync(sendOtpHandler))
router.post('/otp/verify', catchAsync(verifyOtpHandler))
router.post('/webhooks/payment', paymentWebhookHandler)

export default router
