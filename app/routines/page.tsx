import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import RoutinesClient from '@/components/routines-client'
import Header from '@/components/header'
import PageIntro from '@/components/page-intro'

export default async function RoutinesPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="Rutinitas"
        backHref="/"
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageIntro eyebrow="Rencana latihanmu" title="Yang penting, terasa pas." description="Rutinitas favorit, template untuk mencoba, dan kiriman teman. Pilih yang cocok buat sesi hari ini."><Link href="/routines/new" className="app-primary-action"><Plus size={17} aria-hidden="true" /> Buat rutinitas</Link></PageIntro>
        <RoutinesClient />
      </div>
    </main>
  )
}
