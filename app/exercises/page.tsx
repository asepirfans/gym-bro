import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import ExercisesClient from '@/components/exercises-client'
import Header from '@/components/header'
import PageIntro from '@/components/page-intro'

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
        <PageIntro eyebrow="Kenali gerakannya" title="Gerakan kecil, banyak pilihan." description="Cari gerakan berdasarkan nama atau kelompok otot, lalu susun sesi yang sesuai rencanamu." />
        <ExercisesClient />
      </div>
    </main>
  )
}
