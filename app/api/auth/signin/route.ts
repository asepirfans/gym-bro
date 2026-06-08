import { authenticateUser } from '@/lib/simple-auth'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return Response.json({ error: 'Missing email or password' }, { status: 400 })
    }

    // Authenticate user
    const user = await authenticateUser(email, password)

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
    console.log('[v0] Signin error:', error)
    return Response.json({ error: error.message || 'Sign in failed' }, { status: 401 })
  }
}
