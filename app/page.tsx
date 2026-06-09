import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, Calendar, TrendingUp, LogOut } from 'lucide-react'
import DashboardClient from '@/components/dashboard-client'
import { pool } from '@/lib/db'

export default async function DashboardPage() {
  // Get session token from cookie
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('better-auth.session_token')?.value

  if (!sessionToken) {
    redirect('/sign-in')
  }

  // Get user from session
  const sessionResult = await pool.query(
    'SELECT u.id, u.email, u.name FROM "session" s JOIN "user" u ON s.userId = u.id WHERE s.token = $1 AND s.expiresAt > NOW()',
    [sessionToken]
  )

  if (sessionResult.rows.length === 0) {
    redirect('/sign-in')
  }

  const session = { user: sessionResult.rows[0] }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-white">GymBro</h1>
          </div>
          <div className="flex items-center gap-6">
            {/* <div className="text-sm text-slate-400">
              Welcome, <span className="font-semibold text-slate-200">{session.user.name || session.user.email}</span>
            </div> */}
            <form
              action={async () => {
                'use server'
                const cookieStore = await cookies()
                cookieStore.delete('better-auth.session_token')
                redirect('/sign-in')
              }}
            >
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Dashboard Client Component */}
        <DashboardClient />
      </div>
    </main>
  )
}
