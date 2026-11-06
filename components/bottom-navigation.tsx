'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, BookOpen, TrendingUp, User } from 'lucide-react'
export default function BottomNavigation({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname()
  if (!authenticated || ['/sign-in', '/sign-up', '/workouts/start'].some(route => pathname?.startsWith(route))) return null
  const items = [
    { href: '/', label: 'Ringkasan', Icon: Home },
    { href: '/workouts', label: 'Riwayat', Icon: CalendarDays },
    { href: '/routines', label: 'Rutinitas', Icon: BookOpen },
    { href: '/progress', label: 'Progres', Icon: TrendingUp },
    { href: '/profile', label: 'Profil', Icon: User },
  ]
  return <nav className="app-bottom-nav" aria-label="Navigasi aplikasi">{items.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={(href === '/' ? pathname === '/' : pathname?.startsWith(href)) ? 'page' : undefined}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span></Link>)}</nav>
}
