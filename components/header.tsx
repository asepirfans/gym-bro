'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dumbbell, Flame, ArrowLeft, LogOut } from 'lucide-react'
import { getDashboardStats, logoutAction } from '@/app/actions/dashboard'
import { GymBroLogo } from '@/components/ui/gymbro-logo'

interface HeaderProps {
  title?: string
  backHref?: string
  actionButton?: React.ReactNode
  showLogout?: boolean
}

export default function Header({ title, backHref, actionButton, showLogout = false }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [streak, setStreak] = useState<{ currentStreak: number; workedOutThisWeek: boolean } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        if (data.streak) {
          setStreak(data.streak)
        }
      } catch (err) {
        console.error('Failed to load header streak:', err)
      }
    }
    load()
  }, [])

  // Flame style configuration
  const getFlameStyle = () => {
    if (!streak || streak.currentStreak === 0) {
      // Extinguished/padam (gray outline)
      return 'text-slate-600 fill-none opacity-40'
    }
    
    // Active / evolving flame styles
    const animate = streak.workedOutThisWeek ? 'animate-bounce' : ''
    if (streak.currentStreak <= 2) {
      return `text-orange-500 fill-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)] ${animate}`
    }
    if (streak.currentStreak <= 4) {
      return `text-blue-500 fill-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)] ${animate}`
    }
    if (streak.currentStreak <= 7) {
      return `text-purple-500 fill-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.6)] ${animate}`
    }
    return `text-yellow-500 fill-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.7)] ${animate}`
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left Side: Logo, Back Button, Title */}
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="md:hidden">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          {/* Logo + Flame (Evolving next to name) */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 mr-1">
              <GymBroLogo className="h-8 w-8 drop-shadow-[0_0_6px_rgba(249,115,22,0.2)]" />
              <span className="text-lg font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">GymBro</span>
            </Link>
            
            {/* Evolving Flame */}
            <div className="flex items-center gap-1 relative group">
              <Flame className={`h-5 w-5 transition-all duration-300 ${getFlameStyle()}`} />
              {streak && streak.currentStreak > 0 && (
                <span className="text-[9px] font-extrabold text-white bg-slate-800/80 px-1 rounded border border-slate-700 min-w-[14px] text-center">
                  {streak.currentStreak}
                </span>
              )}
              
              {/* Tooltip hint on hover */}
              <div className="absolute top-7 left-0 hidden group-hover:block bg-slate-950 text-white text-[9px] font-bold py-1 px-2 rounded border border-slate-800 shadow-xl whitespace-nowrap z-50">
                {streak && streak.currentStreak > 0 
                  ? `${streak.currentStreak} Minggu Konsisten` 
                  : 'Streak Padam (0 W)'}
              </div>
            </div>
          </div>
          
          {title && (
            <span className="hidden md:inline text-slate-600 font-medium">|</span>
          )}
          {title && (
            <h1 className="hidden md:inline text-sm font-semibold text-slate-300">{title}</h1>
          )}
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition ${
              pathname === '/' 
                ? 'text-orange-500 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/workouts" 
            className={`text-sm font-medium transition ${
              pathname?.startsWith('/workouts') 
                ? 'text-orange-500 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            History
          </Link>
          <Link 
            href="/routines" 
            className={`text-sm font-medium transition ${
              pathname?.startsWith('/routines') 
                ? 'text-orange-500 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Routines
          </Link>
          <Link 
            href="/progress" 
            className={`text-sm font-medium transition ${
              pathname?.startsWith('/progress') 
                ? 'text-orange-500 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Progress
          </Link>
          <Link 
            href="/exercises" 
            className={`text-sm font-medium transition ${
              pathname?.startsWith('/exercises') 
                ? 'text-orange-500 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exercises
          </Link>
          <Link 
            href="/profile" 
            className={`text-sm font-medium transition ${
              pathname?.startsWith('/profile') 
                ? 'text-orange-500 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </Link>
        </nav>

        {/* Right Side: Action Button or Logout */}
        <div className="flex items-center gap-3">
          {actionButton}
          
          {showLogout && (
            <button
              onClick={async () => {
                // Server-side logout trigger to delete HttpOnly cookie
                await logoutAction()
                router.push('/')
                router.refresh()
              }}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
