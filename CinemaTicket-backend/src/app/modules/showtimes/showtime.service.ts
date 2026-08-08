import { prisma } from '../../lib/prisma'
import AppError from '../../errorHelpers/AppError'

import { releaseExpiredSeats } from '../bookings/booking.service'

export const getShowtimeSeatMap = async (showtimeId: string) => {
  if (!showtimeId) {
    throw new AppError(400, 'Showtime id is required')
  }

  await releaseExpiredSeats(showtimeId)

  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    select: { id: true },
  })

  if (!showtime) {
    throw new AppError(404, 'Showtime not found')
  }

  const showSeats = await prisma.showSeat.findMany({
    where: { showtimeId },
    include: {
      seat: true,
    },
    orderBy: {
      seat: {
        row: 'asc',
      },
    },
  })

  return showSeats.map((showSeat) => ({
    showSeatId: showSeat.id,
    seatId: showSeat.seatId,
    row: showSeat.seat.row,
    number: showSeat.seat.number,
    type: showSeat.seat.type,
    status: showSeat.status,
    bookingId: showSeat.bookingId,
    holdExpiresAt: showSeat.holdExpiresAt,
  }))
}
