'use client'

import { useState, useEffect, useRef } from 'react'
import { Flame, X } from 'lucide-react'
import { getDashboardStats } from '@/app/actions/dashboard'
import { usePathname } from 'next/navigation'

interface StreakData {
  currentStreak: number
  bestStreak: number
  activeStreak: boolean
  workedOutThisWeek: boolean
}

export default function FloatingStreakWidget() {
  const pathname = usePathname()
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState({ x: 20, y: 120 }) // Distance from right, bottom
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const dragStartPos = useRef({ x: 0, y: 0 })
  const widgetStartPos = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Hide on auth pages or active workout screen
  const hiddenRoutes = ['/sign-in', '/sign-up', '/workouts/start']
  
  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        if (data.streak) {
          setStreak(data.streak)
        }
      } catch (err) {
        console.error('Failed to load floating streak:', err)
      } finally {
        setLoading(false)
      }
    }
    
    // Skip loading data if path is hidden
    if (!hiddenRoutes.some(route => pathname?.startsWith(route))) {
      load()
    } else {
      setLoading(false)
    }
  }, [pathname])

  // Load persisted position from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gymbro_floating_widget_pos')
      if (saved) {
        try {
          setPosition(JSON.parse(saved))
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [])

  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null
  }

  if (loading || !streak || streak.currentStreak === 0) {
    return null
  }

  // Determine dynamic flame coloring based on streak level
  const getFlameColor = (currentStreak: number) => {
    if (currentStreak <= 2) {
      return { 
        fill: 'fill-orange-500', 
        text: 'text-orange-500', 
        bg: 'bg-orange-950/80', 
        border: 'border-orange-500/40 shadow-orange-500/10' 
      }
    }
    if (currentStreak <= 4) {
      return { 
        fill: 'fill-blue-500', 
        text: 'text-blue-500', 
        bg: 'bg-blue-950/80', 
        border: 'border-blue-500/40 shadow-blue-500/10' 
      }
    }
    if (currentStreak <= 7) {
      return { 
        fill: 'fill-purple-500', 
        text: 'text-purple-500', 
        bg: 'bg-purple-950/80', 
        border: 'border-purple-500/40 shadow-purple-500/10' 
      }
    }
    return { 
      fill: 'fill-yellow-500', 
      text: 'text-yellow-500', 
      bg: 'bg-yellow-950/80', 
      border: 'border-yellow-500/50 shadow-yellow-500/20' 
    }
  }

  const theme = getFlameColor(streak.currentStreak)

  // Draggable Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (widgetRef.current) {
      widgetRef.current.setPointerCapture(e.pointerId)
    }
    setIsDragging(true)
    hasDragged.current = false
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    widgetStartPos.current = { x: position.x, y: position.y }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStartPos.current.x
    const deltaY = e.clientY - dragStartPos.current.y

    // If moved by more than 5px, it is considered a drag
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDragged.current = true
    }

    // Update position (x is distance from right side, y is distance from bottom side)
    const newX = Math.max(10, Math.min(window.innerWidth - 80, widgetStartPos.current.x - deltaX))
    const newY = Math.max(70, Math.min(window.innerHeight - 80, widgetStartPos.current.y - deltaY))

    setPosition({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (widgetRef.current) {
      widgetRef.current.releasePointerCapture(e.pointerId)
    }
    setIsDragging(false)
    
    // Save to localStorage
    localStorage.setItem('gymbro_floating_widget_pos', JSON.stringify(position))

    // If they didn't drag, toggle popover
    if (!hasDragged.current) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        right: `${position.x}px`,
        bottom: `${position.y}px`,
        touchAction: 'none',
        zIndex: 9999,
      }}
      className="select-none transition-shadow duration-300"
    >
      {/* Floating Widget Button */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing border-2 backdrop-blur-md shadow-2xl transition-all duration-300 ${
          isDragging ? 'scale-105 shadow-orange-500/20' : ''
        } ${theme.bg} ${theme.border}`}
      >
        <Flame className={`w-7 h-7 ${streak.workedOutThisWeek ? 'animate-bounce' : ''} ${theme.fill} ${theme.text}`} />
        
        {/* Streak number badge */}
        <span className="absolute -top-1 -right-1 bg-white text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-slate-800 shadow-md">
          {streak.currentStreak}
        </span>
      </div>

      {/* Mini Popover Information */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-64 bg-slate-950/95 border border-slate-800 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-left z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200"
          onPointerDown={(e) => e.stopPropagation()} // Prevent dragging from inside popover
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Streak Info</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="mt-2 space-y-1">
            <p className="text-sm font-extrabold text-white">
              🔥 {streak.currentStreak} Minggu Konsisten!
            </p>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              {streak.workedOutThisWeek ? (
                <span className="text-green-400 font-medium">✓ Minggu ini sudah tuntas. Bagus!</span>
              ) : (
                <span className="text-amber-400 font-medium">⚠️ Belum latihan minggu ini. Jaga streak-mu!</span>
              )}
            </p>
            <div className="border-t border-slate-800/80 pt-2 mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Rekor Terbaik</span>
              <span className="text-slate-300 font-bold">🏆 {streak.bestStreak} Minggu</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
