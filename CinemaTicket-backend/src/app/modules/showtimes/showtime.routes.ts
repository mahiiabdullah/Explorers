import express from 'express'
import { catchAsync } from '../../shared/cathAsync'
import { getSeatMap } from './showtime.controller'

const router = express.Router()

router.get('/:showtimeId/seats', catchAsync(getSeatMap))

export default router
