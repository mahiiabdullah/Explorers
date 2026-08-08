import express from 'express'
import { catchAsync } from '../../shared/cathAsync'
import { signupHandler, loginHandler, meHandler } from './auth.controller'

const router = express.Router()

router.post('/signup', catchAsync(signupHandler))
router.post('/login', catchAsync(loginHandler))
router.get('/me', catchAsync(meHandler))

export default router