import crypto from 'crypto'
import { pool } from './db'
import { cookies } from 'next/headers'

const SALT = process.env.AUTH_SALT || 'default-salt'

export async function hashPassword(password: string): Promise<string> {
  return crypto
    .pbkdf2Sync(password, SALT, 1000, 64, 'sha512')
    .toString('hex')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export async function createUser(email: string, password: string, name: string) {
  try {
    const passwordHash = await hashPassword(password)
    const userId = crypto.randomBytes(16).toString('hex')
    
    const result = await pool.query(
      'INSERT INTO "user" (id, email, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [userId, email, name]
    )

    // Create account record for password storage
    const accountResult = await pool.query(
      'INSERT INTO "account" (id, "accountId", "providerId", "userId", password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        crypto.randomBytes(16).toString('hex'),
        email,
        'password',
        userId,
        passwordHash
      ]
    )

    return result.rows[0]
  } catch (error: any) {
    if (error.code === '23505') { // unique constraint violation
      throw new Error('Email already exists')
    }
    throw error
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const userResult = await pool.query(
      'SELECT u.id, u.email, u.name FROM "user" u WHERE u.email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password')
    }

    const user = userResult.rows[0]

    // Get password from account table
    const accountResult = await pool.query(
      'SELECT password FROM "account" WHERE "userId" = $1 AND "providerId" = $2',
      [user.id, 'password']
    )

    if (accountResult.rows.length === 0 || !accountResult.rows[0].password) {
      throw new Error('Invalid email or password')
    }

    const isValid = await verifyPassword(password, accountResult.rows[0].password)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    return user
  } catch (error: any) {
    throw new Error(error.message || 'Authentication failed')
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('better-auth.session_token')?.value

    if (!sessionToken) {
      return null
    }

    const sessionResult = await pool.query(
      'SELECT u.id, u.email, u.name FROM "session" s JOIN "user" u ON s.userId = u.id WHERE s.token = $1 AND s.expiresAt > NOW()',
      [sessionToken]
    )

    if (sessionResult.rows.length === 0) {
      return null
    }

    const user = sessionResult.rows[0]
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}
