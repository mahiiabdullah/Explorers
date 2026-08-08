import express from 'express'
import { catchAsync } from '../../shared/cathAsync'
import { getMoviesAndShowtimes } from './movie.controller'

const router = express.Router()

router.get('/', catchAsync(getMoviesAndShowtimes))

export default router
