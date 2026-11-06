import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import WorkoutsClient from '@/components/workouts-client'
import Header from '@/components/header'
import { getUserWorkouts } from '@/app/actions/workouts'
import PageIntro from '@/components/page-intro'

export default async function WorkoutsPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }
  const workouts = await getUserWorkouts()

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="Workout History"
        backHref="/"
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageIntro title="Riwayat latihan"><Link href="/workouts/start" className="app-primary-action"><Plus size={17} aria-hidden="true" /> Mulai latihan</Link></PageIntro>
        <WorkoutsClient userId={session.user.id} initialWorkouts={workouts} />
      </div>
    </main>
  )
}
