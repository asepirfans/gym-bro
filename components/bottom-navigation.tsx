'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BookOpen, TrendingUp, Search, User } from 'lucide-react'

import { checkSessionAction } from '@/app/actions/dashboard'

export default function BottomNavigation() {
  const pathname = usePathname()

  const isPrivateRoute = pathname && (
    pathname === '/workouts' || pathname.startsWith('/workouts/') ||
    pathname === '/routines' || pathname.startsWith('/routines/') ||
    pathname === '/progress' || pathname.startsWith('/progress/') ||
    pathname === '/exercises' || pathname.startsWith('/exercises/') ||
    pathname === '/profile' || pathname.startsWith('/profile/')
  )

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(isPrivateRoute ? true : null)

  useEffect(() => {
    async function check() {
      try {
        const loggedIn = await checkSessionAction()
        setIsAuthenticated(loggedIn)
      } catch (err) {
        console.error('Failed to check session:', err)
        setIsAuthenticated(false)
      }
    }
    check()
  }, [pathname])

  // Routes where bottom navigation should be hidden
  const hiddenRoutes = ['/sign-in', '/sign-up', '/workouts/start']
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null
  }

  // Hide bottom navigation if user is not logged in
  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/workouts', label: 'History', icon: Calendar },
    { href: '/routines', label: 'Routines', icon: BookOpen, isSpecial: true },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/90 border-t border-slate-800 backdrop-blur-md z-50 flex items-end justify-around pb-2 pt-1 px-1 shadow-[0_-5px_20px_rgba(0,0,0,0.6)] md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        // Match exact or child routes for active tab highlight
        const isActive = item.href === '/' 
          ? pathname === '/' 
          : pathname?.startsWith(item.href)

        if (item.isSpecial) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 -mt-6 pb-0.5"
            >
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg border-4 border-slate-950 transition-all duration-300 ${
                  isActive
                    ? 'scale-110 shadow-orange-500/40 from-orange-600 to-amber-500'
                    : 'shadow-orange-950/50 hover:scale-105 active:scale-95'
                }`}
              >
                <Icon className="h-6 w-6 stroke-[2.2px]" />
              </div>
              <span
                className={`text-[9px] mt-1 font-bold tracking-wider transition-colors duration-200 ${
                  isActive ? 'text-orange-500' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        }

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
