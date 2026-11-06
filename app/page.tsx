import { getSession } from '@/lib/simple-auth'
import DashboardClient from '@/components/dashboard-client'
import Header from '@/components/header'
import LandingPage from '@/components/landing-page'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user) {
    return <LandingPage />
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header showLogout={true} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Dashboard Client Component */}
        <DashboardClient userId={session.user.id} userName={session.user.name} />
      </div>
    </main>
  )
}
