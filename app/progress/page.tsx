import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import ProgressAnalytics from '@/components/progress-analytics'
import Header from '@/components/header'

export default async function ProgressPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="Progress & Analytics"
        backHref="/"
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ProgressAnalytics />
      </div>
    </main>
  )
}
