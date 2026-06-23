import { cookies } from 'next/headers'
import DashboardClient from '@/components/dashboard-client'
import { pool } from '@/lib/db'
import Header from '@/components/header'
import LandingPage from '@/components/landing-page'

export default async function DashboardPage() {
  // Get session token from cookie
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('better-auth.session_token')?.value

  if (!sessionToken) {
    return <LandingPage />
  }

  // Get user from session
  const sessionResult = await pool.query(
    'SELECT u.id, u.email, u.name FROM "session" s JOIN "user" u ON s.userId = u.id WHERE s.token = $1 AND s.expiresAt > NOW()',
    [sessionToken]
  )

  if (sessionResult.rows.length === 0) {
    return <LandingPage />
  }

  const session = { user: sessionResult.rows[0] }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header showLogout={true} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Dashboard Client Component */}
        <DashboardClient userId={session.user.id} />
      </div>
    </main>
  )
}
