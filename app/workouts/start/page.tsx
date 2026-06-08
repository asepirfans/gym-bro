import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import WorkoutLogger from '@/components/workout-logger'
import { Suspense } from 'react'

export default async function StartWorkoutPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link href="/workouts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Start Workout</h1>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Suspense fallback={<div className="text-center text-slate-400 py-12">Loading workout logger...</div>}>
          <WorkoutLogger />
        </Suspense>
      </div>
    </main>
  )
}
