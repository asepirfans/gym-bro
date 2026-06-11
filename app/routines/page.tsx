import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import RoutinesClient from '@/components/routines-client'
import Header from '@/components/header'

export default async function RoutinesPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="My Routines"
        backHref="/"
        actionButton={
          <Link href="/routines/new">
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600 cursor-pointer">
              <Plus className="h-4 w-4" />
              New Routine
            </Button>
          </Link>
        }
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <RoutinesClient />
      </div>
    </main>
  )
}
