import { createUser } from '@/lib/simple-auth'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Create user
    const user = await createUser(email, password, name)

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const cookieStore = await cookies()
    cookieStore.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return Response.json({ user, success: true })
  } catch (error: any) {
    console.log('[v0] Signup error:', error)
    return Response.json({ error: error.message || 'Signup failed' }, { status: 400 })
  }
}
