'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, BookOpen, TrendingUp, Plus } from 'lucide-react'
import OverviewTab from '@/components/tabs/overview'
import { getDashboardStats } from '@/app/actions/dashboard'
import ActiveWorkoutBanner from '@/components/active-workout-banner'
import WorkoutCalendar from '@/components/workout-calendar'

export default function DashboardClient({ userId, userName }: { userId: string; userName?: string }) {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setFailed(true)).finally(() => setLoading(false))
  }, [])
  const metrics = [
    { href: '/workouts', label: 'Sesi dalam 7 hari', value: stats?.workoutsCount ?? 0, Icon: Dumbbell },
    { href: '/routines', label: 'Rutinitas tersimpan', value: stats?.routinesCount ?? 0, Icon: BookOpen },
    { href: '/progress', label: 'Rekor pribadi', value: stats?.progressCount ?? 0, Icon: TrendingUp },
  ]
  const lastWorkout = stats?.recentWorkouts[0]
  return (
    <div className="dashboard-content">
      <ActiveWorkoutBanner userId={userId} />
      <section className="dashboard-start" aria-labelledby="dashboard-title">
        <div className="dashboard-start-heading">
          <h1 id="dashboard-title">Halo, {userName?.trim().split(/\s+/)[0] || 'Bro'}.</h1>
          {lastWorkout ? <Link href="/workouts" className="dashboard-last-session"><span>Terakhir:</span><strong>{lastWorkout.name}</strong><span>· {lastWorkout.duration} menit</span></Link> : <p className="dashboard-last-session">{loading ? 'Memuat sesi terakhir…' : failed ? 'Catat sesi latihan baru.' : 'Belum ada sesi latihan.'}</p>}
        </div>
        <div className="dashboard-start-actions"><Link href="/workouts/start" className="dashboard-start-button"><Plus size={19} aria-hidden="true" /> Mulai latihan</Link><Link href="/routines" className="dashboard-routine-link">Rutinitas</Link></div>
      </section>
      <div className="dashboard-metrics" aria-busy={loading}>{metrics.map(({ href, label, value, Icon }) => <Link href={href} key={href}><div><span>{label}</span><strong>{loading ? '…' : failed ? 'N/A' : value}</strong></div><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></Link>)}</div>
      {failed && <p role="alert" className="text-sm text-red-300">Statistik belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.</p>}
      <WorkoutCalendar />
      <OverviewTab stats={stats} loading={loading} />
    </div>
  )
}
