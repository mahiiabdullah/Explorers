import { Request, Response } from 'express'
import { getMoviesWithShowtimes } from './movie.service'
import { sendResponse } from '../../shared/sendResponse'

export const getMoviesAndShowtimes = async (req: Request, res: Response) => {
  const movies = await getMoviesWithShowtimes()

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Movies and showtimes retrieved successfully',
    data: movies,
  })
}
