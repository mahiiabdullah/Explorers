import express from 'express'
import { catchAsync } from '../../shared/cathAsync'
import {
  createSeatHold,
  confirmBookingHandler,
  paymentCallbackHandler,
  getBookingHandler,
  listBookingsHandler,
} from './booking.controller'

const router = express.Router()

router.get('/', catchAsync(listBookingsHandler))
router.post('/hold', catchAsync(createSeatHold))
router.post('/payment/callback', catchAsync(paymentCallbackHandler))
router.get('/:bookingId', catchAsync(getBookingHandler))
router.post('/:bookingId/confirm', catchAsync(confirmBookingHandler))

export default router
