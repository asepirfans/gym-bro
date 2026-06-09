'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MuscleData {
  muscle: string
  volume: number
  reps: number
}

interface MuscleHeatmapProps {
  data: MuscleData[]
}

interface MuscleGroup {
  name: string
  categoryKey: string
  paths: { d: string; isFront: boolean }[]
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    name: 'Chest',
    categoryKey: 'chest',
    paths: [
      // Left Chest (Pecs)
      { d: 'M 74,54 C 68,54 62,56 58,61 C 55,65 54,75 58,81 C 62,86 70,86 74,84 Z', isFront: true },
      // Right Chest (Pecs)
      { d: 'M 76,54 C 82,54 88,56 92,61 C 95,65 96,75 92,81 C 88,86 80,86 76,84 Z', isFront: true },
    ]
  },
  {
    name: 'Back',
    categoryKey: 'back',
    paths: [
      // Upper Back Left Lat / Trap
      { d: 'M 226,54 C 221,62 217,75 214,92 C 219,95 228,96 234,95 C 234,80 232,65 228,54 Z', isFront: false },
      // Upper Back Right Lat / Trap
      { d: 'M 244,54 C 249,62 253,75 256,92 C 251,95 242,96 236,95 C 236,80 238,65 242,54 Z', isFront: false },
      // Lower Back
      { d: 'M 221,96 C 219,105 220,125 224,142 C 228,143 242,143 246,142 C 250,125 251,105 249,96 C 241,98 229,98 221,96 Z', isFront: false },
    ]
  },
  {
    name: 'Legs',
    categoryKey: 'legs',
    paths: [
      // Front Left Thigh (Quad)
      { d: 'M 52,143 C 50,165 52,195 58,220 C 62,221 68,220 73,212 C 73,195 72,165 67,143 Z', isFront: true },
      // Front Right Thigh (Quad)
      { d: 'M 98,143 C 100,165 98,195 92,220 C 88,221 82,220 77,212 C 77,195 78,165 83,143 Z', isFront: true },
      // Front Left Calf
      { d: 'M 58,222 C 55,235 55,260 61,288 C 63,289 65,289 66,288 C 68,260 67,235 62,222 Z', isFront: true },
      // Front Right Calf
      { d: 'M 92,222 C 95,235 95,260 89,288 C 87,289 85,289 84,288 C 82,260 83,235 88,222 Z', isFront: true },
      // Back Left Thigh (Glute/Hamstring)
      { d: 'M 212,143 C 210,165 212,195 218,220 C 222,221 228,220 233,212 C 233,195 232,165 227,143 Z', isFront: false },
      // Back Right Thigh (Glute/Hamstring)
      { d: 'M 258,143 C 260,165 258,195 252,220 C 248,221 242,220 237,212 C 237,195 238,165 243,143 Z', isFront: false },
      // Back Left Calf
      { d: 'M 218,222 C 215,235 215,260 221,288 C 223,289 225,289 226,288 C 228,260 227,235 222,222 Z', isFront: false },
      // Back Right Calf
      { d: 'M 252,222 C 255,235 255,260 249,288 C 247,289 245,289 244,288 C 242,260 243,235 248,222 Z', isFront: false },
    ]
  },
  {
    name: 'Shoulders',
    categoryKey: 'shoulders',
    paths: [
      // Front Left Shoulder (Deltoid)
      { d: 'M 68,51 C 60,54 52,56 46,62 C 43,65 42,72 46,75 C 50,77 54,74 58,68 C 61,64 63,58 66,54 Z', isFront: true },
      // Front Right Shoulder (Deltoid)
      { d: 'M 82,51 C 90,54 98,56 104,62 C 107,65 108,72 104,75 C 100,77 96,74 92,68 C 89,64 87,58 84,54 Z', isFront: true },
      // Back Left Shoulder
      { d: 'M 228,51 C 220,54 212,56 206,62 C 203,65 202,72 206,75 C 210,77 214,74 218,68 C 221,64 223,58 226,54 Z', isFront: false },
      // Back Right Shoulder
      { d: 'M 242,51 C 250,54 258,56 264,62 C 267,65 268,72 264,75 C 260,77 256,74 252,68 C 249,64 247,58 244,54 Z', isFront: false },
    ]
  },
  {
    name: 'Arms',
    categoryKey: 'arms',
    paths: [
      // Front Left Arm
      { d: 'M 45,74 C 40,82 37,98 38,115 C 39,122 43,124 46,122 C 48,112 49,95 53,83 Z', isFront: true },
      // Front Right Arm
      { d: 'M 105,74 C 110,82 113,98 112,115 C 111,122 107,124 104,122 C 102,112 101,95 97,83 Z', isFront: true },
      // Back Left Arm
      { d: 'M 205,74 C 200,82 197,98 198,115 C 199,122 203,124 206,122 C 208,112 209,95 213,83 Z', isFront: false },
      // Back Right Arm
      { d: 'M 265,74 C 270,82 273,98 272,115 C 271,122 267,124 264,122 C 262,112 261,95 257,83 Z', isFront: false },
    ]
  },
  {
    name: 'Core',
    categoryKey: 'core',
    paths: [
      // Abs / Core
      { d: 'M 61,86 C 58,95 59,120 63,142 C 67,144 83,144 87,142 C 91,120 92,95 89,86 C 82,88 68,88 61,86 Z', isFront: true },
    ]
  }
]

export default function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  const [hoveredGroup, setHoveredGroup] = useState<MuscleGroup | null>(null)

  const maxVolume = Math.max(...data.map(m => m.volume), 1)

  const getIntensity = (categoryKey: string) => {
    const found = data.find(m => m.muscle.toLowerCase() === categoryKey.toLowerCase())
    if (!found) return 0
    return found.volume / maxVolume
  }

  const getMuscleStats = (categoryKey: string) => {
    const found = data.find(m => m.muscle.toLowerCase() === categoryKey.toLowerCase())
    return {
      volume: found?.volume || 0,
      reps: found?.reps || 0
    }
  }

  const getColor = (intensity: number, isHovered: boolean) => {
    if (intensity === 0) {
      return isHovered ? '#334155' : '#1e293b'
    }
    // Slate-800 #1e293b (30, 41, 59) to Cyber Orange #f97316 (249, 115, 22)
    const r = Math.round(30 + (249 - 30) * intensity)
    const g = Math.round(41 + (115 - 41) * intensity)
    const b = Math.round(59 + (22 - 59) * intensity)

    if (isHovered) {
      // Make it shine even brighter when hovered
      return `rgba(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)}, 0.95)`
    }
    return `rgba(${r}, ${g}, ${b}, 0.8)`
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Trained Muscles Heatmap</CardTitle>
        <CardDescription>Visualisasi intensitas volume latihan otot Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Overlay Info */}
        <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 min-h-[72px] flex flex-col justify-center items-center text-center">
          {hoveredGroup ? (
            <div>
              <p className="text-sm font-bold text-orange-400 capitalize">{hoveredGroup.name}</p>
              <div className="flex gap-4 mt-1 text-xs text-slate-300 justify-center">
                <span>Volume: <strong>{getMuscleStats(hoveredGroup.categoryKey).volume.toLocaleString()} kg</strong></span>
                <span>•</span>
                <span>Reps: <strong>{getMuscleStats(hoveredGroup.categoryKey).reps.toLocaleString()}</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 font-medium">Arahkan kursor ke otot untuk melihat detail volume</p>
          )}
        </div>

        {/* Heatmap Graphic */}
        <div className="flex justify-center items-center py-4 bg-slate-950/40 rounded-xl border border-slate-900">
          <svg
            width="320"
            height="310"
            viewBox="0 0 320 310"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none"
          >
            {/* Glow Filter */}
            <defs>
              <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Front Head */}
            <circle cx="75" cy="30" r="12" fill="#334155" stroke="#475569" strokeWidth="1" />
            {/* Back Head */}
            <circle cx="235" cy="30" r="12" fill="#334155" stroke="#475569" strokeWidth="1" />

            {/* Labels */}
            <text x="75" y="306" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle">
              FRONT VIEW
            </text>
            <text x="235" y="306" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle">
              BACK VIEW
            </text>

            {/* Muscle Groups rendering */}
            {MUSCLE_GROUPS.map((group) => {
              const intensity = getIntensity(group.categoryKey)
              const isHovered = hoveredGroup?.categoryKey === group.categoryKey

              return (
                <g
                  key={group.categoryKey}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredGroup(group)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  filter={isHovered ? 'url(#glow-orange)' : undefined}
                >
                  {group.paths.map((path, idx) => (
                    <path
                      key={idx}
                      d={path.d}
                      fill={getColor(intensity, isHovered)}
                      stroke={isHovered ? '#f97316' : '#0f172a'}
                      strokeWidth={isHovered ? '1.5' : '1'}
                      className="transition-all duration-300"
                    />
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-900">
          <span>Kurang Terlatih</span>
          <div className="flex gap-1 h-3 w-32 rounded-full overflow-hidden border border-slate-800 bg-slate-950">
            <span className="flex-1 bg-[#1e293b]" />
            <span className="flex-1 bg-[#6a3c1c]" />
            <span className="flex-1 bg-[#b15819]" />
            <span className="flex-1 bg-[#f97316]" />
          </div>
          <span>Sangat Terlatih</span>
        </div>
      </CardContent>
    </Card>
  )
}
