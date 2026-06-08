import { pool } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'

const SALT = 'gym-track-salt'

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex')
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return Response.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const userId = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(password)

    await pool.query(
      'INSERT INTO "user" (id, email, name, emailVerified) VALUES ($1, $2, $3, true)',
      [userId, email, name]
    )

    // Create account (for password storage)
    await pool.query(
      'INSERT INTO "account" (id, accountId, providerId, userId, password) VALUES ($1, $2, $3, $4, $5)',
      [
        crypto.randomBytes(16).toString('hex'),
        email,
        'password',
        userId,
        passwordHash
      ]
    )

    return Response.json({ success: true, userId })
  } catch (error: any) {
    console.error('[v0] Signup error:', error)
    return Response.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    )
  }
}
