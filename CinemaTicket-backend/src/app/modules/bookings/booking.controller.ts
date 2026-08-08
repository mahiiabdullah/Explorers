import { Request, Response } from 'express'
import { holdSeats, confirmBooking, getBookingById, listBookings } from './booking.service'
import { sendResponse } from '../../shared/sendResponse'

export const createSeatHold = async (req: Request, res: Response) => {
  const { userId, showtimeId, seatIds } = req.body

  const result = await holdSeats({ userId, showtimeId, seatIds })

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Seats held successfully',
    data: result,
  })
}

export const confirmBookingHandler = async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId as string

  const booking = await confirmBooking({ bookingId })

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking confirmed successfully',
    data: { booking },
  })
}

export const paymentCallbackHandler = async (req: Request, res: Response) => {
  const { bookingId, paymentStatus } = req.body

  if (!bookingId) {
    throw new Error('bookingId is required')
  }

  const normalizedStatus = String(paymentStatus || '').toLowerCase()
  if (normalizedStatus !== 'succeeded' && normalizedStatus !== 'success') {
    return sendResponse(res, {
      statusCode: 202,
      success: true,
      message: 'Payment received but booking not confirmed',
      data: { bookingId, paymentStatus },
    })
  }

  const booking = await confirmBooking({ bookingId })

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking confirmed successfully after payment',
    data: { booking },
  })
}

export const getBookingHandler = async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId as string
  const booking = await getBookingById({ bookingId })
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking retrieved successfully',
    data: booking,
  })
}

export const listBookingsHandler = async (req: Request, res: Response) => {
  const { userId, status } = req.query as { userId?: string; status?: any }
  const bookings = await listBookings({ userId, status })
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: bookings,
  })
}
