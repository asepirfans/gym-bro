import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import WorkoutLogger from '@/components/workout-logger'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function StartWorkoutPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/workouts">
            <Button variant="ghost" size="icon" aria-label="Kembali ke riwayat latihan">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1"><p className="text-xs text-slate-400 mb-1">GymBro / Ruang latihan</p><h1 className="text-lg sm:text-xl font-semibold text-white">Satu set lebih dekat.</h1></div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Suspense fallback={<div className="text-center text-slate-400 py-12">Loading workout logger...</div>}>
          <WorkoutLogger userId={session.user.id} />
        </Suspense>
      </div>
    </main>
  )
}
