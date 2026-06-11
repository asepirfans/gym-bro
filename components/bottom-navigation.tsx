'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BookOpen, TrendingUp, Search } from 'lucide-react'

export default function BottomNavigation() {
  const pathname = usePathname()

  // Routes where bottom navigation should be hidden
  const hiddenRoutes = ['/sign-in', '/sign-up', '/workouts/start']
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/workouts', label: 'History', icon: Calendar },
    { href: '/routines', label: 'Routines', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/exercises', label: 'Exercises', icon: Search },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/90 border-t border-slate-800 backdrop-blur-md z-50 flex items-center justify-around py-2 px-1 shadow-[0_-5px_20px_rgba(0,0,0,0.6)] md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        // Match exact or child routes for active tab highlight
        const isActive = item.href === '/' 
          ? pathname === '/' 
          : pathname?.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? 'text-orange-500 scale-105 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'}`} />
            <span className="text-[10px] mt-1 tracking-wider">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
