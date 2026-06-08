import { pool } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'

const SALT = 'gym-track-salt'

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex')
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json(
        { error: 'Missing email or password' },
        { status: 400 }
      )
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, name, email FROM "user" WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = userResult.rows[0]

    // Get password from account
    const accountResult = await pool.query(
      'SELECT password FROM "account" WHERE userId = $1 AND providerId = $2 ORDER BY createdAt DESC LIMIT 1',
      [user.id, 'password']
    )

    if (accountResult.rows.length === 0 || !accountResult.rows[0].password) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordHash = hashPassword(password)
    if (passwordHash !== accountResult.rows[0].password) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await pool.query(
      'INSERT INTO "session" (id, token, userId, expiresAt) VALUES ($1, $2, $3, $4)',
      [
        crypto.randomBytes(16).toString('hex'),
        sessionToken,
        user.id,
        expiresAt.toISOString()
      ]
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return Response.json({ success: true, userId: user.id })
  } catch (error: any) {
    console.error('[v0] Signin error:', error)
    return Response.json(
      { error: error.message || 'Sign in failed' },
      { status: 500 }
    )
  }
}
