import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Header from '@/components/header'
import ProfileClient from './profile-client'
import PageIntro from '@/components/page-intro'

export default async function ProfilePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header title="Profil Saya" backHref="/" />

      <div className="mx-auto max-w-xl px-6 py-8">
        <PageIntro eyebrow="Ruang kecil buat kamu" title="Senang kenal kamu." description="Atur nama dan username supaya teman lebih mudah menemukan rutinitas yang kamu bagikan." />
        <ProfileClient />
      </div>
    </main>
  )
}
