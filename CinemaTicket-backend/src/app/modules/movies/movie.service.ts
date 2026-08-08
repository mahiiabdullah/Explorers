import { prisma } from '../../lib/prisma'
import AppError from '../../errorHelpers/AppError'

export const getMoviesWithShowtimes = async () => {
  const movies = await prisma.movie.findMany({
    include: {
      showtimes: {
        orderBy: { startsAt: 'asc' },
        include: {
          screen: {
            include: {
              theatre: true,
            },
          },
        },
      },
    },
  })

  return movies
}
