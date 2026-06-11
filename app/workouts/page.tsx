import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import WorkoutsClient from '@/components/workouts-client'
import Header from '@/components/header'

export default async function WorkoutsPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="Workout History"
        backHref="/"
        actionButton={
          <Link href="/workouts/start">
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600 cursor-pointer">
              <Plus className="h-4 w-4" />
              Start Workout
            </Button>
          </Link>
        }
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <WorkoutsClient userId={session.user.id} />
      </div>
    </main>
  )
}
