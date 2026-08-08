import { prisma } from '../../lib/prisma'
import AppError from '../../errorHelpers/AppError'

const HOLD_DURATION_MINUTES = Number(process.env.SEAT_HOLD_TTL_MINUTES || '5')

interface HoldSeatsParams {
  userId: string
  showtimeId: string
  seatIds: string[]
}

export const releaseExpiredSeats = async (showtimeId?: string) => {
  const now = new Date()

  const seatWhere: Record<string, unknown> = {
    status: 'HELD',
    holdExpiresAt: { lt: now },
  }
  if (showtimeId) {
    seatWhere.showtimeId = showtimeId
  }

  await prisma.$transaction(async (tx) => {
    await tx.showSeat.updateMany({
      where: seatWhere,
      data: {
        status: 'AVAILABLE',
        bookingId: null,
        holdExpiresAt: null,
      },
    })

    const bookingWhere: Record<string, unknown> = {
      status: 'HELD',
      expiresAt: { lt: now },
    }
    if (showtimeId) {
      bookingWhere.showtimeId = showtimeId
    }

    await tx.booking.updateMany({
      where: bookingWhere,
      data: {
        status: 'EXPIRED',
      },
    })
  })
}

export const holdSeats = async ({ userId, showtimeId, seatIds }: HoldSeatsParams) => {
  if (!userId || !showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new AppError(400, 'Invalid hold request payload')
  }

  await releaseExpiredSeats(showtimeId)

  const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000)

  return prisma.$transaction(async (tx) => {
    const showtime = await tx.showtime.findUnique({
      where: { id: showtimeId },
      select: { basePrice: true },
    })

    if (!showtime) {
      throw new AppError(404, 'Showtime not found')
    }

    await tx.showSeat.updateMany({
      where: {
        showtimeId,
        status: 'HELD',
        holdExpiresAt: { lt: new Date() },
      },
      data: {
        status: 'AVAILABLE',
        bookingId: null,
        holdExpiresAt: null,
      },
    })

    await tx.booking.updateMany({
      where: {
        status: 'HELD',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
      },
    })

    const booking = await tx.booking.create({
      data: {
        userId,
        showtimeId,
        status: 'HELD',
        amount: showtime.basePrice * seatIds.length,
        expiresAt: holdExpiresAt,
      },
    })

    const updateResult = await tx.showSeat.updateMany({
      where: {
        id: { in: seatIds },
        showtimeId,
        status: 'AVAILABLE',
      },
      data: {
        status: 'HELD',
        bookingId: booking.id,
        holdExpiresAt,
      },
    })

    if (updateResult.count !== seatIds.length) {
      throw new AppError(409, 'One or more seats are no longer available')
    }

    const heldSeats = await tx.showSeat.findMany({
      where: {
        id: { in: seatIds },
        showtimeId,
      },
    })

    return {
      booking,
      seats: heldSeats,
    }
  })
}

interface ConfirmBookingParams {
  bookingId: string
}

export const confirmBooking = async ({ bookingId }: ConfirmBookingParams) => {
  if (!bookingId) {
    throw new AppError(400, 'Booking id is required')
  }

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        expiresAt: true,
      },
    })

    if (!booking) {
      throw new AppError(404, 'Booking not found')
    }

    if (!['HELD', 'AWAITING_PAYMENT'].includes(booking.status)) {
      throw new AppError(409, 'Only held or awaiting payment bookings can be confirmed')
    }

    if (booking.expiresAt && booking.expiresAt < new Date()) {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'EXPIRED' },
      })

      await tx.showSeat.updateMany({
        where: { bookingId, status: 'HELD' },
        data: {
          status: 'AVAILABLE',
          bookingId: null,
          holdExpiresAt: null,
        },
      })

      throw new AppError(410, 'Booking hold has expired')
    }

    await tx.showSeat.updateMany({
      where: { bookingId, status: 'HELD' },
      data: {
        status: 'BOOKED',
        holdExpiresAt: null,
      },
    })

    const confirmedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    })

    return confirmedBooking
  })
}

interface ListBookingsParams {
  userId?: string
  status?: 'HELD' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED'
}

export const listBookings = async ({ userId, status }: ListBookingsParams) => {
  const bookings = await prisma.booking.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      showSeats: { include: { seat: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookings.map((b) => ({
    ...b,
    seats: b.showSeats.map((showSeat) => ({
      showSeatId: showSeat.id,
      seatId: showSeat.seatId,
      row: showSeat.seat.row,
      number: showSeat.seat.number,
      type: showSeat.seat.type,
      status: showSeat.status,
      bookingId: showSeat.bookingId,
      holdExpiresAt: showSeat.holdExpiresAt,
    })),
  }))
}

interface GetBookingParams {
  bookingId: string
}

export const getBookingById = async ({ bookingId }: GetBookingParams) => {
  if (!bookingId) {
    throw new AppError(400, 'Booking id is required')
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      showSeats: { include: { seat: true } },
      payment: true,
    },
  })

  if (!booking) {
    throw new AppError(404, 'Booking not found')
  }

  return {
    ...booking,
    seats: booking.showSeats.map((showSeat) => ({
      showSeatId: showSeat.id,
      seatId: showSeat.seatId,
      row: showSeat.seat.row,
      number: showSeat.seat.number,
      type: showSeat.seat.type,
      status: showSeat.status,
      bookingId: showSeat.bookingId,
      holdExpiresAt: showSeat.holdExpiresAt,
    })),
  }
}
