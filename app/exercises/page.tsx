import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import ExercisesClient from '@/components/exercises-client'
import Header from '@/components/header'

export default async function ExercisesPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="Exercise Library"
        backHref="/"
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ExercisesClient />
      </div>
    </main>
  )
}
