import express from "express"
import bookingRoutes from '../modules/bookings/booking.routes'
import movieRoutes from '../modules/movies/movie.routes'
import paymentRoutes from '../modules/payments/payment.routes'
import showtimeRoutes from '../modules/showtimes/showtime.routes'
import authRoutes from '../modules/auth/auth.routes'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/movies', movieRoutes)
router.use('/showtimes', showtimeRoutes)
router.use('/bookings', bookingRoutes)
router.use('/payments', paymentRoutes)

export const IndexRoutes = router