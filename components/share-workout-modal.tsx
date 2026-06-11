'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Download, Sliders, Check } from 'lucide-react'
import { getWorkout } from '@/app/actions/workouts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ShareWorkoutModalProps {
  workoutId: number | null
  isOpen: boolean
  onClose: () => void
}

interface SetData {
  id: number
  setNumber: number
  reps: number | null
  weight: string | null
  exerciseName: string
  exerciseCategory: string
}

interface WorkoutDetail {
  id: number
  name: string
  startedAt: string
  duration: number | null
  notes: string | null
  sets: SetData[]
  userName: string
  userEmail: string
}

type ThemeKey = 'orange' | 'blue' | 'purple' | 'stealth' | 'transparent'
type LayoutKey = 'radar' | 'list' | 'heatmap' | 'combined'

const THEMES: Record<ThemeKey, { name: string; bgStart: string; bgEnd: string; primary: string; secondary: string; glow: string }> = {
  orange: {
    name: 'Cyber Orange',
    bgStart: '#09090b',
    bgEnd: '#1e140d',
    primary: '#f97316',
    secondary: '#ea580c',
    glow: 'rgba(249, 115, 22, 0.15)',
  },
  blue: {
    name: 'Electric Blue',
    bgStart: '#030712',
    bgEnd: '#0d1b2a',
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  purple: {
    name: 'Neon Purple',
    bgStart: '#090514',
    bgEnd: '#1a0d2e',
    primary: '#a855f7',
    secondary: '#7c3aed',
    glow: 'rgba(168, 85, 247, 0.15)',
  },
  stealth: {
    name: 'Carbon Gold',
    bgStart: '#0a0a0a',
    bgEnd: '#221f1a',
    primary: '#eab308',
    secondary: '#ca8a04',
    glow: 'rgba(234, 179, 8, 0.15)',
  },
  transparent: {
    name: 'Transparent',
    bgStart: 'transparent',
    bgEnd: 'transparent',
    primary: '#f97316',
    secondary: '#ea580c',
    glow: 'transparent',
  },
}

const HEATMAP_MUSCLE_GROUPS = [
  {
    name: 'Chest',
    categoryKey: 'chest',
    paths: [
      { d: 'M 74,54 C 68,54 62,56 58,61 C 55,65 54,75 58,81 C 62,86 70,86 74,84 Z', isFront: true },
      { d: 'M 76,54 C 82,54 88,56 92,61 C 95,65 96,75 92,81 C 88,86 80,86 76,84 Z', isFront: true },
    ]
  },
  {
    name: 'Back',
    categoryKey: 'back',
    paths: [
      { d: 'M 226,54 C 221,62 217,75 214,92 C 219,95 228,96 234,95 C 234,80 232,65 228,54 Z', isFront: false },
      { d: 'M 244,54 C 249,62 253,75 256,92 C 251,95 242,96 236,95 C 236,80 238,65 242,54 Z', isFront: false },
      { d: 'M 221,96 C 219,105 220,125 224,142 C 228,143 242,143 246,142 C 250,125 251,105 249,96 C 241,98 229,98 221,96 Z', isFront: false },
    ]
  },
  {
    name: 'Legs',
    categoryKey: 'legs',
    paths: [
      { d: 'M 52,143 C 50,165 52,195 58,220 C 62,221 68,220 73,212 C 73,195 72,165 67,143 Z', isFront: true },
      { d: 'M 98,143 C 100,165 98,195 92,220 C 88,221 82,220 77,212 C 77,195 78,165 83,143 Z', isFront: true },
      { d: 'M 58,222 C 55,235 55,260 61,288 C 63,289 65,289 66,288 C 68,260 67,235 62,222 Z', isFront: true },
      { d: 'M 92,222 C 95,235 95,260 89,288 C 87,289 85,289 84,288 C 82,260 83,235 88,222 Z', isFront: true },
      { d: 'M 212,143 C 210,165 212,195 218,220 C 222,221 228,220 233,212 C 233,195 232,165 227,143 Z', isFront: false },
      { d: 'M 258,143 C 260,165 258,195 252,220 C 248,221 242,220 237,212 C 237,195 238,165 243,143 Z', isFront: false },
      { d: 'M 218,222 C 215,235 215,260 221,288 C 223,289 225,289 226,288 C 228,260 227,235 222,222 Z', isFront: false },
      { d: 'M 252,222 C 255,235 255,260 249,288 C 247,289 245,289 244,288 C 242,260 243,235 248,222 Z', isFront: false },
    ]
  },
  {
    name: 'Shoulders',
    categoryKey: 'shoulders',
    paths: [
      { d: 'M 68,51 C 60,54 52,56 46,62 C 43,65 42,72 46,75 C 50,77 54,74 58,68 C 61,64 63,58 66,54 Z', isFront: true },
      { d: 'M 82,51 C 90,54 98,56 104,62 C 107,65 108,72 104,75 C 100,77 96,74 92,68 C 89,64 87,58 84,54 Z', isFront: true },
      { d: 'M 228,51 C 220,54 212,56 206,62 C 203,65 202,72 206,75 C 210,77 214,74 218,68 C 221,64 223,58 226,54 Z', isFront: false },
      { d: 'M 242,51 C 250,54 258,56 264,62 C 267,65 268,72 264,75 C 260,77 256,74 252,68 C 249,64 247,58 244,54 Z', isFront: false },
    ]
  },
  {
    name: 'Arms',
    categoryKey: 'arms',
    paths: [
      { d: 'M 45,74 C 40,82 37,98 38,115 C 39,122 43,124 46,122 C 48,112 49,95 53,83 Z', isFront: true },
      { d: 'M 105,74 C 110,82 113,98 112,115 C 111,122 107,124 104,122 C 102,112 101,95 97,83 Z', isFront: true },
      { d: 'M 205,74 C 200,82 197,98 198,115 C 199,122 203,124 206,122 C 208,112 209,95 213,83 Z', isFront: false },
      { d: 'M 265,74 C 270,82 273,98 272,115 C 271,122 267,124 264,122 C 262,112 261,95 257,83 Z', isFront: false },
    ]
  },
  {
    name: 'Core',
    categoryKey: 'core',
    paths: [
      { d: 'M 61,86 C 58,95 59,120 63,142 C 67,144 83,144 87,142 C 91,120 92,95 89,86 C 82,88 68,88 61,86 Z', isFront: true },
    ]
  }
]

export default function ShareWorkoutModal({ workoutId, isOpen, onClose }: ShareWorkoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('orange')
  const [activeLayout, setActiveLayout] = useState<LayoutKey>('list')
  const [handle, setHandle] = useState('')
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!isOpen || !workoutId) return

    async function load() {
      setLoading(true)
      try {
        const data = await getWorkout(workoutId!)
        
        // Mapped response structure
        const detail: WorkoutDetail = {
          id: data.id,
          name: data.routineName || 'Quick Workout',
          startedAt: data.startedAt.toString(),
          duration: data.duration,
          notes: data.notes,
          sets: data.sets.map((s: any) => ({
            id: s.id,
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            exerciseName: s.exerciseName,
            exerciseCategory: s.exerciseCategory,
          })),
          userName: data.userName || '',
          userEmail: data.userEmail || '',
        }
        setWorkout(detail)
        
        // Default handle from username or email prefix
        const emailPrefix = detail.userEmail ? `@${detail.userEmail.split('@')[0]}` : '@gymbro'
        const defaultHandle = detail.userName ? `@${detail.userName.toLowerCase().replace(/\s+/g, '')}` : emailPrefix
        setHandle(defaultHandle)
      } catch (err) {
        console.error('Failed to load workout details:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [workoutId, isOpen])

  if (!isOpen) return null

  // 1. Calculations
  const sets = workout?.sets || []
  const totalSets = sets.length
  
  // Group sets by exercise
  const exerciseGroups: Record<string, { name: string; category: string; sets: SetData[] }> = {}
  sets.forEach((set) => {
    if (!exerciseGroups[set.exerciseName]) {
      exerciseGroups[set.exerciseName] = {
        name: set.exerciseName,
        category: set.exerciseCategory,
        sets: [],
      }
    }
    exerciseGroups[set.exerciseName].sets.push(set)
  })
  
  const exercisesList = Object.values(exerciseGroups)
  
  // Calculate total volume (reps * weight) in kg
  let totalVolume = 0
  sets.forEach((s) => {
    const reps = s.reps || 0
    const weight = s.weight ? parseFloat(s.weight) : 0
    totalVolume += reps * weight
  })

  // Calculate volume by muscle group
  const muscleGroups = ['back', 'legs', 'chest', 'arms', 'core', 'shoulders']
  const volumeByMuscle: Record<string, number> = {
    back: 0,
    legs: 0,
    chest: 0,
    arms: 0,
    core: 0,
    shoulders: 0,
  }
  sets.forEach((s) => {
    const cat = s.exerciseCategory.toLowerCase()
    const reps = s.reps || 0
    const weight = s.weight ? parseFloat(s.weight) : 0
    if (cat in volumeByMuscle) {
      volumeByMuscle[cat] += reps * weight
    }
  })

  const maxMuscleVolume = Math.max(...Object.values(volumeByMuscle), 1)

  // 2. Formatting helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDuration = (mins: number | null) => {
    const minutes = mins || 0
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const rem = minutes % 60
    return rem > 0 ? `${hours} jam ${rem} min` : `${hours} jam`
  }

  const formattedDuration = formatDuration(workout?.duration || 0)

  // 3. SVG rendering values
  const theme = THEMES[activeTheme]

  const getIntensity = (categoryKey: string) => {
    const vol = volumeByMuscle[categoryKey.toLowerCase()] || 0
    return vol / maxMuscleVolume
  }

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return '#1e293b'
    
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 249, g: 115, b: 22 }
    }

    const rgb = hexToRgb(theme.primary)
    const r = Math.round(30 + (rgb.r - 30) * intensity)
    const g = Math.round(41 + (rgb.g - 41) * intensity)
    const b = Math.round(59 + (rgb.b - 59) * intensity)
    return `rgb(${r}, ${g}, ${b})`
  }

  // Concentric Hexagon Calculations for Radar Chart
  const Cx = 400
  const Cy = 640
  const Rmax = 150
  const angles = [
    -Math.PI / 2, // Back (top)
    -Math.PI / 2 + Math.PI / 3, // Legs
    -Math.PI / 2 + (2 * Math.PI) / 3, // Chest
    -Math.PI / 2 + Math.PI, // Arms (bottom)
    -Math.PI / 2 + (4 * Math.PI) / 3, // Core
    -Math.PI / 2 + (5 * Math.PI) / 3, // Shoulders
  ]

  const getHexPoints = (radius: number) => {
    return angles.map((a) => {
      const x = Cx + radius * Math.cos(a)
      const y = Cy + radius * Math.sin(a)
      return `${x},${y}`
    }).join(' ')
  }

  // Calculate data polygon points
  const categoriesOrdered = ['back', 'legs', 'chest', 'arms', 'core', 'shoulders']
  const dataPoints = angles.map((a, idx) => {
    const cat = categoriesOrdered[idx]
    const vol = volumeByMuscle[cat]
    const r = 20 + 130 * (vol / maxMuscleVolume) // Min radius of 20, max 150
    const x = Cx + r * Math.cos(a)
    const y = Cy + r * Math.sin(a)
    return `${x},${y}`
  }).join(' ')

  const labels: { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[] = [
    { text: 'Back', x: Cx, y: Cy - 180, anchor: 'middle' },
    { text: 'Legs', x: Cx + 180 * Math.cos(angles[1]), y: Cy + 180 * Math.sin(angles[1]) + 5, anchor: 'start' },
    { text: 'Chest', x: Cx + 180 * Math.cos(angles[2]), y: Cy + 180 * Math.sin(angles[2]) + 5, anchor: 'start' },
    { text: 'Arms', x: Cx, y: Cy + 195, anchor: 'middle' },
    { text: 'Core', x: Cx + 180 * Math.cos(angles[4]), y: Cy + 180 * Math.sin(angles[4]) + 5, anchor: 'end' },
    { text: 'Shoulders', x: Cx + 180 * Math.cos(angles[5]), y: Cy + 180 * Math.sin(angles[5]) + 5, anchor: 'end' },
  ]

  const getHexPointsComb = (radius: number, cx: number, cy: number) => {
    return angles.map((a) => {
      const x = cx + radius * Math.cos(a)
      const y = cy + radius * Math.sin(a)
      return `${x},${y}`
    }).join(' ')
  }

  const getDataPointsComb = (cx: number, cy: number, r_min: number, r_max: number) => {
    return angles.map((a, idx) => {
      const cat = categoriesOrdered[idx]
      const vol = volumeByMuscle[cat]
      const r = r_min + (r_max - r_min) * (vol / maxMuscleVolume)
      const x = cx + r * Math.cos(a)
      const y = cy + r * Math.sin(a)
      return `${x},${y}`
    }).join(' ')
  }

  // 4. Download Trigger
  const handleDownload = () => {
    if (!svgRef.current) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgRef.current)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.src = url
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 1000
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Clear canvas (in case of transparency)
        ctx.clearRect(0, 0, 800, 1000)
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, 800, 1000)
        
        // Export to PNG
        const pngUrl = canvas.toDataURL('image/png')
        
        // Create link and download
        const a = document.createElement('a')
        a.download = `workout-${(workout?.name || 'quick-workout').toLowerCase().replace(/\s+/g, '-')}.png`
        a.href = pngUrl
        a.click()
      }
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Share Your Workout</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
            Loading sharing options...
          </div>
        ) : !workout ? (
          <div className="flex-1 flex items-center justify-center py-20 text-red-400">
            Workout log could not be loaded.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
            {/* Preview Column */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">Preview</p>
              
              {/* Dynamic SVG container styled for display */}
              <div className="aspect-[4/5] w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950/40 relative">
                <svg
                  ref={svgRef}
                  id="share-card-svg"
                  width="800"
                  height="1000"
                  viewBox="0 0 800 1000"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    background: activeTheme === 'transparent' ? 'transparent' : `linear-gradient(135deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  }}
                >
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={theme.bgStart} />
                      <stop offset="100%" stopColor={theme.bgEnd} />
                    </linearGradient>
                    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={theme.primary} stopOpacity={activeTheme === 'transparent' ? 0 : 0.2} />
                      <stop offset="100%" stopColor={theme.primary} stopOpacity={0} />
                    </radialGradient>
                    <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={theme.primary} stopOpacity="0.55" />
                      <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.25" />
                    </linearGradient>
                    <pattern id="hud-grid" width="4" height="4" patternUnits="userSpaceOnUse">
                      <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.18" />
                    </pattern>
                  </defs>

                  {/* Draw solid background only if not transparent */}
                  {activeTheme !== 'transparent' && (
                    <rect width="800" height="1000" fill="url(#bgGrad)" />
                  )}
                  <circle cx="400" cy="500" r="400" fill="url(#glowGrad)" />

                  {/* Top Branding Header */}
                  <g transform="translate(60, 60)">
                    {/* Dumbbell Icon */}
                    <path
                      d="M 5 20 H 45 M 5 12 V 28 M 12 5 V 35 M 38 5 V 35 M 45 12 V 28"
                      stroke={theme.primary}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <text x="65" y="28" fill="#ffffff" fontSize="28" fontWeight="900" letterSpacing="3">
                      GYMBRO
                    </text>
                  </g>

                  {/* Handle */}
                  <text x="740" y="88" fill="#94a3b8" fontSize="22" fontWeight="600" textAnchor="end">
                    {handle}
                  </text>

                  {/* Workout Info */}
                  <text x="60" y="195" fill="#ffffff" fontSize="54" fontWeight="800">
                    {workout.name}
                  </text>
                  <text x="60" y="240" fill="#94a3b8" fontSize="22" fontWeight="500">
                    {formatDate(workout.startedAt)}
                  </text>

                  {/* Divider */}
                  <line x1="60" y1="275" x2="740" y2="275" stroke="#334155" strokeWidth="2" strokeOpacity="0.5" />

                  {/* Stats Row (Volume removed for clarity, Duration and Sets spaced out) */}
                  <g transform="translate(60, 315)">
                    {/* Duration */}
                    <g transform="translate(100, 0)">
                      <text x="0" y="40" fill="#ffffff" fontSize={formattedDuration.length > 7 ? "34" : "44"} fontWeight="800" textAnchor="middle">
                        {formattedDuration}
                      </text>
                      <text x="0" y="75" fill="#64748b" fontSize="18" fontWeight="700" letterSpacing="1.5" textAnchor="middle">
                        DURATION
                      </text>
                    </g>

                    {/* Sets */}
                    <g transform="translate(540, 0)">
                      <text x="0" y="40" fill="#ffffff" fontSize="44" fontWeight="800" textAnchor="middle">
                        {totalSets} sets
                      </text>
                      <text x="0" y="75" fill="#64748b" fontSize="18" fontWeight="700" letterSpacing="1.5" textAnchor="middle">
                        SETS
                      </text>
                    </g>
                  </g>

                  {/* Divider */}
                  <line x1="60" y1="435" x2="740" y2="435" stroke="#334155" strokeWidth="2" strokeOpacity="0.5" />

                  {/* Layout Contents */}
                  {activeLayout === 'heatmap' ? (
                    <g>
                      {/* Grid background for cybernetic HUD effect */}
                      <g stroke={theme.primary} strokeWidth="0.5" strokeOpacity="0.12">
                        {/* Vertical grid lines */}
                        <line x1="100" y1="460" x2="100" y2="880" />
                        <line x1="200" y1="460" x2="200" y2="880" />
                        <line x1="300" y1="460" x2="300" y2="880" />
                        <line x1="400" y1="460" x2="400" y2="880" strokeOpacity="0.25" strokeWidth="1" />
                        <line x1="500" y1="460" x2="500" y2="880" />
                        <line x1="600" y1="460" x2="600" y2="880" />
                        <line x1="700" y1="460" x2="700" y2="880" />
                        {/* Horizontal grid lines */}
                        <line x1="60" y1="500" x2="740" y2="500" />
                        <line x1="60" y1="580" x2="740" y2="580" />
                        <line x1="60" y1="660" x2="740" y2="660" />
                        <line x1="60" y1="740" x2="740" y2="740" />
                        <line x1="60" y1="820" x2="740" y2="820" />
                      </g>

                      {/* FRONT VIEW */}
                      <g transform="translate(135, 480) scale(1.4)">
                        <circle cx="75" cy="30" r="12" fill={`${theme.primary}22`} stroke={theme.primary} strokeWidth="1" strokeOpacity="0.5" />
                        <path d="M 71,41 C 71,46 72,50 69,53 L 81,53 C 78,50 79,46 79,41 Z" fill={`${theme.primary}11`} stroke={theme.primary} strokeWidth="0.8" strokeOpacity="0.4" />
                        
                        {HEATMAP_MUSCLE_GROUPS.map((group) => {
                          const intensity = getIntensity(group.categoryKey)
                          const color = getHeatmapColor(intensity)
                          
                          return group.paths
                            .filter((p) => p.isFront)
                            .map((path, idx) => (
                              <g key={`${group.name}-front-${idx}`}>
                                <path
                                  d={path.d}
                                  fill={color}
                                  stroke={intensity > 0 ? theme.primary : '#334155'}
                                  strokeWidth="1.2"
                                />
                                <path
                                  d={path.d}
                                  fill="url(#hud-grid)"
                                  style={{ mixBlendMode: 'overlay' }}
                                />
                              </g>
                            ))
                        })}
                        <text x="75" y="300" fill="#64748b" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="1">
                          FRONT
                        </text>
                      </g>

                      {/* BACK VIEW */}
                      <g transform="translate(231, 480) scale(1.4)">
                        <circle cx="235" cy="30" r="12" fill={`${theme.primary}22`} stroke={theme.primary} strokeWidth="1" strokeOpacity="0.5" />
                        <path d="M 231,41 C 231,46 232,50 229,53 L 241,53 C 238,50 239,46 239,41 Z" fill={`${theme.primary}11`} stroke={theme.primary} strokeWidth="0.8" strokeOpacity="0.4" />
                        
                        {HEATMAP_MUSCLE_GROUPS.map((group) => {
                          const intensity = getIntensity(group.categoryKey)
                          const color = getHeatmapColor(intensity)
                          
                          return group.paths
                            .filter((p) => !p.isFront)
                            .map((path, idx) => (
                              <g key={`${group.name}-back-${idx}`}>
                                <path
                                  d={path.d}
                                  fill={color}
                                  stroke={intensity > 0 ? theme.primary : '#334155'}
                                  strokeWidth="1.2"
                                />
                                <path
                                  d={path.d}
                                  fill="url(#hud-grid)"
                                  style={{ mixBlendMode: 'overlay' }}
                                />
                              </g>
                            ))
                        })}
                        <text x="235" y="300" fill="#64748b" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="1">
                          BACK
                        </text>
                      </g>
                    </g>
                  ) : activeLayout === 'radar' ? (
                    <g>
                      {/* Hexagonal Grids */}
                      <polygon points={getHexPoints(50)} fill="none" stroke="#1e293b" strokeWidth="1.5" />
                      <polygon points={getHexPoints(100)} fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,4" />
                      <polygon points={getHexPoints(150)} fill="none" stroke="#475569" strokeWidth="2" />

                      {/* Radial Lines */}
                      {angles.map((a, idx) => (
                        <line
                          key={idx}
                          x1={Cx}
                          y1={Cy}
                          x2={Cx + Rmax * Math.cos(a)}
                          y2={Cy + Rmax * Math.sin(a)}
                          stroke="#334155"
                          strokeWidth="1.5"
                        />
                      ))}

                      {/* Data Polygon */}
                      <polygon points={dataPoints} fill="url(#polyGrad)" stroke={theme.primary} strokeWidth="3" />

                      {/* Axis Labels */}
                      {labels.map((label, idx) => (
                        <text
                          key={idx}
                          x={label.x}
                          y={label.y}
                          fill="#f8fafc"
                          fontSize="20"
                          fontWeight="700"
                          textAnchor={label.anchor}
                          alignmentBaseline="middle"
                          letterSpacing="0.5"
                        >
                          {label.text}
                        </text>
                      ))}
                    </g>
                  ) : activeLayout === 'combined' ? (
                    <g>
                      {/* Left Side: Smaller Radar Chart */}
                      <g>
                        {/* Concentric Hexagons */}
                        <polygon points={getHexPointsComb(35, 230, 670)} fill="none" stroke="#1e293b" strokeWidth="1" />
                        <polygon points={getHexPointsComb(70, 230, 670)} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                        <polygon points={getHexPointsComb(105, 230, 670)} fill="none" stroke="#475569" strokeWidth="1.5" />

                        {/* Radial Lines */}
                        {angles.map((a, idx) => (
                          <line
                            key={idx}
                            x1={230}
                            y1={670}
                            x2={230 + 105 * Math.cos(a)}
                            y2={670 + 105 * Math.sin(a)}
                            stroke="#334155"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Data Polygon */}
                        <polygon points={getDataPointsComb(230, 670, 15, 105)} fill="url(#polyGrad)" stroke={theme.primary} strokeWidth="2.5" />

                        {/* Labels for Combined Radar */}
                        {[
                          { text: 'Back', x: 230, y: 670 - 125, anchor: 'middle' as const },
                          { text: 'Legs', x: 230 + 125 * Math.cos(angles[1]), y: 670 + 125 * Math.sin(angles[1]) + 4, anchor: 'start' as const },
                          { text: 'Chest', x: 230 + 125 * Math.cos(angles[2]), y: 670 + 125 * Math.sin(angles[2]) + 4, anchor: 'start' as const },
                          { text: 'Arms', x: 230, y: 670 + 135, anchor: 'middle' as const },
                          { text: 'Core', x: 230 + 125 * Math.cos(angles[4]), y: 670 + 125 * Math.sin(angles[4]) + 4, anchor: 'end' as const },
                          { text: 'Shoulders', x: 230 + 125 * Math.cos(angles[5]), y: 670 + 125 * Math.sin(angles[5]) + 4, anchor: 'end' as const },
                        ].map((label, idx) => (
                          <text
                            key={idx}
                            x={label.x}
                            y={label.y}
                            fill="#f8fafc"
                            fontSize="15"
                            fontWeight="700"
                            textAnchor={label.anchor}
                            alignmentBaseline="middle"
                            letterSpacing="0.3"
                          >
                            {label.text}
                          </text>
                        ))}
                      </g>

                      {/* Vertical separator line between radar and list */}
                      <line x1="400" y1="465" x2="400" y2="875" stroke="#1e293b" strokeWidth="1.5" />

                      {/* Right Side: List of exercises (up to 5 items) */}
                      <g>
                        {exercisesList.slice(0, 5).map((ex, index) => {
                          const yStart = 485 + index * 80
                          const setSummary = ex.sets.map(s => `${s.reps || 0}r ${s.weight ? `@${parseFloat(s.weight)}kg` : ''}`).join(', ')
                          return (
                            <g key={index}>
                              {/* Sets count bullet */}
                              <rect x="425" y={yStart} width="50" height="36" rx="6" fill={`${theme.primary}20`} />
                              <text
                                x="450"
                                y={yStart + 24}
                                fill={theme.primary}
                                fontSize="18"
                                fontWeight="800"
                                textAnchor="middle"
                              >
                                {ex.sets.length}x
                              </text>

                              {/* Exercise Name */}
                              <text x="490" y={yStart + 18} fill="#ffffff" fontSize="18" fontWeight="700">
                                {ex.name.length > 20 ? ex.name.slice(0, 18) + '...' : ex.name}
                              </text>
                              
                              {/* Sets reps details */}
                              <text x="490" y={yStart + 42} fill="#94a3b8" fontSize="14" fontWeight="500">
                                {setSummary.length > 24 ? setSummary.slice(0, 22) + '...' : setSummary}
                              </text>

                              {/* Divider line except last element */}
                              {index < 4 && index < exercisesList.length - 1 && (
                                <line x1="425" y1={yStart + 63} x2="740" y2={yStart + 63} stroke="#1e293b" strokeWidth="1" />
                              )}
                            </g>
                          )
                        })}

                        {/* +X more indicator */}
                        {exercisesList.length > 5 && (
                          <g transform="translate(425, 875)">
                            <text x="0" y="0" fill={theme.primary} fontSize="15" fontWeight="700">
                              + {exercisesList.length - 5} more exercises logged
                            </text>
                          </g>
                        )}
                      </g>
                    </g>
                  ) : (
                    <g>
                      {/* Left Column (items 0 to 4) */}
                      {exercisesList.slice(0, 5).map((ex, index) => {
                        const yStart = 485 + index * 80
                        const setSummary = ex.sets.map(s => `${s.reps || 0}r ${s.weight ? `@${parseFloat(s.weight)}kg` : ''}`).join(', ')
                        return (
                          <g key={index}>
                            {/* Sets count bullet */}
                            <rect x="60" y={yStart} width="55" height="40" rx="8" fill={`${theme.primary}20`} />
                            <text
                              x="87.5"
                              y={yStart + 27}
                              fill={theme.primary}
                              fontSize="22"
                              fontWeight="800"
                              textAnchor="middle"
                            >
                              {ex.sets.length}x
                            </text>

                            {/* Exercise Name */}
                            <text x="135" y={yStart + 22} fill="#ffffff" fontSize="22" fontWeight="700">
                              {ex.name.length > 22 ? ex.name.slice(0, 20) + '...' : ex.name}
                            </text>
                            
                            {/* Sets reps details */}
                            <text x="135" y={yStart + 48} fill="#94a3b8" fontSize="16" fontWeight="500">
                              {setSummary.length > 26 ? setSummary.slice(0, 24) + '...' : setSummary}
                            </text>

                            {/* Divider line except last element */}
                            {index < 4 && index < exercisesList.length - 1 && (
                              <line x1="60" y1={yStart + 65} x2="370" y2={yStart + 65} stroke="#1e293b" strokeWidth="1.5" />
                            )}
                          </g>
                        )
                      })}

                      {/* Vertical separator line between columns */}
                      {exercisesList.length > 5 && (
                        <line x1="395" y1="485" x2="395" y2="855" stroke="#1e293b" strokeWidth="1.5" />
                      )}

                      {/* Right Column (items 5 to 9) */}
                      {exercisesList.slice(5, 10).map((ex, index) => {
                        const yStart = 485 + index * 80
                        const setSummary = ex.sets.map(s => `${s.reps || 0}r ${s.weight ? `@${parseFloat(s.weight)}kg` : ''}`).join(', ')
                        return (
                          <g key={index + 5}>
                            {/* Sets count bullet */}
                            <rect x="420" y={yStart} width="55" height="40" rx="8" fill={`${theme.primary}20`} />
                            <text
                              x="447.5"
                              y={yStart + 27}
                              fill={theme.primary}
                              fontSize="22"
                              fontWeight="800"
                              textAnchor="middle"
                            >
                              {ex.sets.length}x
                            </text>

                            {/* Exercise Name */}
                            <text x="495" y={yStart + 22} fill="#ffffff" fontSize="22" fontWeight="700">
                              {ex.name.length > 22 ? ex.name.slice(0, 20) + '...' : ex.name}
                            </text>
                            
                            {/* Sets reps details */}
                            <text x="495" y={yStart + 48} fill="#94a3b8" fontSize="16" fontWeight="500">
                              {setSummary.length > 26 ? setSummary.slice(0, 24) + '...' : setSummary}
                            </text>

                            {/* Divider line except last element */}
                            {index < 4 && index + 5 < exercisesList.length - 1 && (
                              <line x1="420" y1={yStart + 65} x2="740" y2={yStart + 65} stroke="#1e293b" strokeWidth="1.5" />
                            )}
                          </g>
                        )
                      })}

                      {/* +X more indicator */}
                      {exercisesList.length > 10 && (
                        <g transform={`translate(60, ${485 + 5 * 80 - 15})`}>
                          <text x="0" y="20" fill={theme.primary} fontSize="20" fontWeight="700">
                            + {exercisesList.length - 10} more exercises logged
                          </text>
                        </g>
                      )}
                    </g>
                  )}

                  {/* Footer Info */}
                  <line x1="60" y1="910" x2="740" y2="910" stroke="#334155" strokeWidth="2" strokeOpacity="0.5" />
                  <text x="60" y="955" fill="#64748b" fontSize="18" fontWeight="700" letterSpacing="1">
                    POWERED BY GYMBRO APP
                  </text>
                  <text x="740" y="955" fill={theme.primary} fontSize="20" fontWeight="800" textAnchor="end" letterSpacing="1">
                    BEAST MODE ON
                  </text>
                </svg>
              </div>
            </div>

            {/* Customization Column */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                {/* 1. Layout Style Option */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-orange-500" /> Card Layout
                  </label>
                  <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setActiveLayout('list')}
                      className={`py-2 text-xs font-semibold rounded-md transition ${
                        activeLayout === 'list'
                          ? 'bg-orange-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setActiveLayout('radar')}
                      className={`py-2 text-xs font-semibold rounded-md transition ${
                        activeLayout === 'radar'
                          ? 'bg-orange-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Balance
                    </button>
                    <button
                      onClick={() => setActiveLayout('heatmap')}
                      className={`py-2 text-xs font-semibold rounded-md transition ${
                        activeLayout === 'heatmap'
                          ? 'bg-orange-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Heatmap
                    </button>
                    <button
                      onClick={() => setActiveLayout('combined')}
                      className={`py-2 text-xs font-semibold rounded-md transition ${
                        activeLayout === 'combined'
                          ? 'bg-orange-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Combined
                    </button>
                  </div>
                </div>

                {/* 2. Theme / Gradient Option */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Background Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
                      const t = THEMES[key]
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveTheme(key)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition ${
                            activeTheme === key
                              ? 'border-orange-500 bg-orange-950/10 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          } ${key === 'transparent' ? 'col-span-2' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-white/10"
                              style={{ background: key === 'transparent' ? 'transparent' : `linear-gradient(135deg, ${t.bgStart}, ${t.bgEnd})` }}
                            />
                            {t.name}
                          </div>
                          {activeTheme === key && <Check className="h-4 w-4 text-orange-500" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Handle Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Social Handle / Tag</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@yourname"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-md font-bold text-white flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" /> Download Image to Flex
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
