import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { prisma } from '../../lib/prisma'
import AppError from '../../errorHelpers/AppError'
import { jwtUtils } from '../../utils/jwt'

const scryptAsync = promisify(scrypt)

const SCRYPT_KEYLEN = 64
// Per rulebook §I, never use fallbacks that hide missing env vars —
// bail at module load if JWT secrets aren't configured.
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET
if (!ACCESS_SECRET) {
  throw new Error('[auth] ACCESS_TOKEN_SECRET is not set. Refusing to start with an insecure default.')
}
const ACCESS_TTL = process.env.ACCESS_TOKEN_EXPIRES_IN || '1d'

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hashHex] = stored.split(':')
  if (!salt || !hashHex) return false
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer
  const stored_ = Buffer.from(hashHex, 'hex')
  if (stored_.length !== derived.length) return false
  return timingSafeEqual(stored_, derived)
}

interface SignupParams {
  name: string
  email: string
  phone: string
  password: string
}

export const signup = async ({ name, email, phone, password }: SignupParams) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  })
  if (existing) {
    throw new AppError(409, 'An account with that email or phone already exists')
  }
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  })
  return signIn(user)
}

interface LoginParams {
  email: string
  password: string
}

export const login = async ({ email, password }: LoginParams) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    throw new AppError(401, 'Invalid email or password')
  }
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    throw new AppError(401, 'Invalid email or password')
  }
  return signIn(user)
}

const signIn = async (user: {
  id: string
  email: string | null
  name: string | null
  phone: string
}) => {
  const token = jwtUtils.createToken(
    { sub: user.id, email: user.email ?? undefined },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL },
  )
  return {
    token,
    user: {
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? '',
      phone: user.phone,
    },
  }
}

export const me = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User not found')
  }
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.name ?? '',
    phone: user.phone,
  }
}