import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { signup, login, me } from './auth.service'
import { sendResponse } from '../../shared/sendResponse'
import AppError from '../../errorHelpers/AppError'

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET
if (!ACCESS_SECRET) {
  throw new Error('[auth] ACCESS_TOKEN_SECRET is not set. Refusing to start with an insecure default.')
}

export const signupHandler = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body ?? {}
  if (!name || !email || !phone || !password) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'name, email, phone and password are required',
      errorDetails: { missing: ['name', 'email', 'phone', 'password'].filter((k) => !req.body?.[k]) },
    })
  }
  const result = await signup({ name, email, phone, password })
  // Per Problem Statement §A, signup must return tokens + user.
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Account created',
    data: {
      tokens: {
        accessToken: result.token,
        refreshToken: result.token, // same token until refresh-token route lands
      },
      user: result.user,
    },
  })
}

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'email and password are required',
      errorDetails: { missing: ['email', 'password'].filter((k) => !req.body?.[k]) },
    })
  }
  const result = await login({ email, password })
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Signed in',
    data: {
      tokens: {
        accessToken: result.token,
        refreshToken: result.token,
      },
      user: result.user,
    },
  })
}

export const meHandler = async (req: Request, res: Response) => {
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) {
    throw new AppError(401, 'Missing Authorization header')
  }
  try {
    const decoded = jwt.verify(m[1], ACCESS_SECRET as string) as { sub?: string }
    if (!decoded.sub) {
      throw new AppError(401, 'Invalid token')
    }
    const user = await me(decoded.sub)
    sendResponse(res, { statusCode: 200, success: true, message: 'OK', data: user })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(401, 'Invalid token')
  }
}