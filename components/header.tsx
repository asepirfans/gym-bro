'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, CalendarCheck2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDashboardStats, logoutAction } from '@/app/actions/dashboard'
import { GymBroLogo } from '@/components/ui/gymbro-logo'
import { ThemeToggle } from '@/components/theme-toggle'

interface HeaderProps {
  title?: string
  backHref?: string
  actionButton?: React.ReactNode
  showLogout?: boolean
}
const navigation = [
  ['/', 'Ringkasan'], ['/workouts', 'Riwayat'], ['/routines', 'Rutinitas'],
  ['/progress', 'Progres'], ['/exercises', 'Gerakan'], ['/profile', 'Profil'],
]

export default function Header({ title, backHref, actionButton, showLogout = false }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [streak, setStreak] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(false)
  useEffect(() => { getDashboardStats().then(data => setStreak(data.streak?.currentStreak || 0)).catch(() => {}) }, [])

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-brand">
          {backHref && <Link href={backHref} aria-label="Kembali" className="md:hidden"><ArrowLeft size={20} /></Link>}
          <Link href="/" className="brand" aria-label="GymBro beranda"><GymBroLogo className="h-8 w-8" /><span>GymBro<span className="brand-dot">.</span></span></Link>
          {streak > 0 && <span className="app-streak" title={`${streak} minggu konsisten`}><CalendarCheck2 size={15} aria-hidden="true" />{streak} mg</span>}
        </div>
        <nav className="app-header-nav" aria-label="Navigasi utama">{navigation.map(([href, label]) => <Link key={href} href={href} aria-current={(href === '/' ? pathname === '/' : pathname?.startsWith(href)) ? 'page' : undefined}>{label}</Link>)}</nav>
        <div className="app-header-actions"><ThemeToggle />{actionButton}{showLogout && <Button variant="ghost" aria-label="Keluar dari akun" disabled={loggingOut} onClick={async () => {
          setLoggingOut(true)
          setLogoutError(false)
          try { await logoutAction(); router.push('/'); router.refresh() } catch { setLogoutError(true); setLoggingOut(false) }
        }}><LogOut size={17} /><span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Keluar'}</span></Button>}</div>
        {title && <p className="app-header-title">{title}</p>}
        {logoutError && <p role="alert" className="text-sm text-red-300">Gagal keluar. Coba lagi.</p>}
      </div>
    </header>
  )
}
