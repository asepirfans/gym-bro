import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import RoutineBuilder from '@/components/routine-builder'
import Header from '@/components/header'
import PageIntro from '@/components/page-intro'

export default async function NewRoutinePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header
        title="Create New Routine"
        backHref="/routines"
      />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <PageIntro eyebrow="Buat sesuai gayamu" title="Susun sesi favoritmu." description="Beri nama, pilih gerakan, lalu atur set dan repetisinya. Kamu bisa menyesuaikannya lagi nanti." />
        <RoutineBuilder />
      </div>
    </main>
  )
}
