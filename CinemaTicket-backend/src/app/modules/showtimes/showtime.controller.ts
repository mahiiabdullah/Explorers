import { Request, Response } from 'express'
import { getShowtimeSeatMap } from './showtime.service'
import { sendResponse } from '../../shared/sendResponse'

export const getSeatMap = async (req: Request, res: Response) => {
  const { showtimeId } = req.params

  const seatMap = await getShowtimeSeatMap(showtimeId as string)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Seat map retrieved successfully',
    data: seatMap,
  })
}
