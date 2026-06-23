import { redirect } from 'next/navigation'
import { getSession } from '@/lib/simple-auth'
import Header from '@/components/header'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header title="Profil Saya" backHref="/" />

      <div className="mx-auto max-w-xl px-6 py-8">
        <ProfileClient />
      </div>
    </main>
  )
}
