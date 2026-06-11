'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Trophy } from 'lucide-react'

interface FitnessAvatarProps {
  currentStreak: number
}

interface AvatarConfig {
  name: string
  color: string
  accentColor: string
  glowClass: string
  shoulderWidth: number
  chestWidth: number
  armThickness: number
  legThickness: number
  trapsHeight: number
  hasCrown: boolean
  desc: string
  boosts: string[]
  nextTier: string | null
  weeksNeeded: number
}

const getAvatarConfig = (streak: number): AvatarConfig => {
  if (streak === 0) {
    return {
      name: 'Newbie Ectomorph',
      color: '#64748b', // Slate
      accentColor: '#475569',
      glowClass: 'bg-slate-500/10',
      shoulderWidth: 26,
      chestWidth: 24,
      armThickness: 3.5,
      legThickness: 4.5,
      trapsHeight: 0,
      hasCrown: false,
      desc: 'Kamu baru memulai! Lakukan workout minggu ini untuk mulai membentuk tubuhmu.',
      boosts: ['+0% Stamina Boost', 'Latih otot dada & lengan'],
      nextTier: 'Lean Athlete',
      weeksNeeded: 1,
    }
  }

  if (streak <= 2) {
    return {
      name: 'Lean Athlete',
      color: '#f97316', // Orange
      accentColor: '#c2410c',
      glowClass: 'bg-orange-500/10',
      shoulderWidth: 34,
      chestWidth: 30,
      armThickness: 5,
      legThickness: 6,
      trapsHeight: 2,
      hasCrown: false,
      desc: 'Tubuhmu mulai beradaptasi dan membentuk otot kering yang atletis!',
      boosts: ['+10% Stamina Boost', '+5% Strength Boost'],
      nextTier: 'Iron Warrior',
      weeksNeeded: 3 - streak,
    }
  }

  if (streak <= 4) {
    return {
      name: 'Iron Warrior',
      color: '#3b82f6', // Blue
      accentColor: '#1d4ed8',
      glowClass: 'bg-blue-500/10',
      shoulderWidth: 44,
      chestWidth: 38,
      armThickness: 7.5,
      legThickness: 8.5,
      trapsHeight: 6,
      hasCrown: false,
      desc: 'Bahu tegap dan lengan kekar. Kamu adalah definisi pejuang besi!',
      boosts: ['+18% Stamina Boost', '+15% Strength Boost', '+10% Recovery Rate'],
      nextTier: 'Golden Beast',
      weeksNeeded: 5 - streak,
    }
  }

  if (streak <= 7) {
    return {
      name: 'Golden Beast',
      color: '#a855f7', // Purple
      accentColor: '#7e22ce',
      glowClass: 'bg-purple-500/10',
      shoulderWidth: 52,
      chestWidth: 44,
      armThickness: 10,
      legThickness: 11,
      trapsHeight: 10,
      hasCrown: false,
      desc: 'Monster konsistensi! Bahu lebar berbentuk V-Taper yang mengerikan.',
      boosts: ['+25% Stamina Boost', '+22% Strength Boost', '+18% Recovery Rate', '+10% Focus State'],
      nextTier: 'Legendary Titan',
      weeksNeeded: 8 - streak,
    }
  }

  // 8+ weeks: Legendary Titan
  return {
    name: 'Legendary Titan',
    color: '#eab308', // Gold
    accentColor: '#a16207',
    glowClass: 'bg-yellow-500/20',
    shoulderWidth: 62,
    chestWidth: 52,
    armThickness: 13,
    legThickness: 14,
    trapsHeight: 14,
    hasCrown: true,
    desc: 'Tingkat Dewa Konsistensi! Mahkota emas dan tubuh raksasa tak tertandingi.',
    boosts: ['+40% God Mode Stamina', '+35% Strength Force', '+30% Recovery Speed', '+20% Aura Shield'],
    nextTier: null,
    weeksNeeded: 0,
  }
}

export default function FitnessAvatar({ currentStreak }: FitnessAvatarProps) {
  const config = getAvatarConfig(currentStreak)
  
  // Calculate evolution progress percentage
  let progressPercent = 0
  if (currentStreak === 0) {
    progressPercent = 0
  } else if (currentStreak <= 2) {
    progressPercent = (currentStreak / 2) * 100
  } else if (currentStreak <= 4) {
    progressPercent = ((currentStreak - 2) / (4 - 2)) * 100
  } else if (currentStreak <= 7) {
    progressPercent = ((currentStreak - 4) / (7 - 4)) * 100
  } else {
    progressPercent = 100
  }

  const waistWidth = 20

  return (
    <Card className={`border-2 transition-all duration-500 overflow-hidden relative ${
      currentStreak > 0 
        ? 'bg-slate-950/40 shadow-lg' 
        : 'border-slate-800 bg-slate-900/50'
    }`} style={{ borderColor: `${config.color}33` }}>
      {/* Background Hologram Grid and Radial Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${config.glowClass}`} />
      
      <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-6">
        {/* Left Side: 3D-Hologram Avatar Viewport */}
        <div className="relative w-44 h-56 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
          {/* HUD Tech Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
          <div className="absolute top-2 left-2 text-[8px] text-slate-500 font-mono tracking-widest uppercase">SYSTEM: ONLINE</div>
          <div className="absolute bottom-2 right-2 text-[8px] text-slate-500 font-mono tracking-widest">STREAK: {currentStreak} W</div>

          {/* SVG human wireframe generator */}
          <svg
            width="170"
            height="210"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.02)]"
          >
            {/* Custom Glow Filters */}
            <defs>
              <filter id="hologram-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g filter="url(#hologram-glow)">
              {/* Crown (Legendary Titan only) */}
              {config.hasCrown && (
                <polygon
                  points="88,24 88,14 93,20 100,8 107,20 112,14 112,24"
                  fill="#eab308"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              )}

              {/* Traps (Upper back/neck connection) */}
              {config.trapsHeight > 0 && (
                <polygon
                  points={`${100 - config.shoulderWidth/2},72 100,${72 - config.trapsHeight} ${100 + config.shoulderWidth/2},72`}
                  fill={`${config.color}22`}
                  stroke={config.color}
                  strokeWidth="1"
                />
              )}

              {/* Head */}
              <circle cx="100" cy="42" r="11" fill="#020617" stroke={config.color} strokeWidth="2" />
              <circle cx="100" cy="42" r="4" fill={config.color} className="opacity-80 animate-ping" />

              {/* Neck */}
              <line x1="100" y1="53" x2="100" y2="72" stroke={config.color} strokeWidth="2" />

              {/* Shoulders joint bar */}
              <line
                x1={100 - config.shoulderWidth / 2}
                y1="72"
                x2={100 + config.shoulderWidth / 2}
                y2="72"
                stroke={config.color}
                strokeWidth="2.5"
              />

              {/* Chest/Torso Muscular V-Shape */}
              <polygon
                points={`
                  ${100 - config.shoulderWidth/2},72 
                  ${100 + config.shoulderWidth/2},72 
                  ${100 + waistWidth/2},130 
                  ${100 - waistWidth/2},130
                `}
                fill="#020617"
                stroke={config.color}
                strokeWidth="2.5"
              />

              {/* Chest Pec Muscle Lines */}
              {currentStreak > 0 && (
                <>
                  <path
                    d={`M 100,72 L ${100 - config.chestWidth/2},72 C ${100 - config.chestWidth/2},90 92,94 100,94 Z`}
                    fill={`${config.color}11`}
                    stroke={config.color}
                    strokeWidth="1"
                  />
                  <path
                    d={`M 100,72 L ${100 + config.chestWidth/2},72 C ${100 + config.chestWidth/2},90 108,94 100,94 Z`}
                    fill={`${config.color}11`}
                    stroke={config.color}
                    strokeWidth="1"
                  />
                </>
              )}

              {/* Abs Details (Shown progressively as strength increases) */}
              {currentStreak >= 3 && (
                <g stroke={config.color} strokeWidth="1" opacity="0.8">
                  {/* Vertical division */}
                  <line x1="100" y1="94" x2="100" y2="128" />
                  {/* Horizontal dividers */}
                  <line x1="93" y1="102" x2="107" y2="102" />
                  <line x1="91" y1="112" x2="109" y2="112" />
                  <line x1="92" y1="122" x2="108" y2="122" />
                </g>
              )}

              {/* Left Arm (Bicep/Tricep & Forearm) */}
              <g stroke={config.color} strokeLinecap="round">
                {/* Upper arm */}
                <line
                  x1={100 - config.shoulderWidth / 2}
                  y1="72"
                  x2={100 - config.shoulderWidth / 2 - 16}
                  y2="110"
                  strokeWidth={config.armThickness}
                />
                {/* Forearm */}
                <line
                  x1={100 - config.shoulderWidth / 2 - 16}
                  y1="110"
                  x2={100 - config.shoulderWidth / 2 - 12}
                  y2="150"
                  strokeWidth={config.armThickness * 0.8}
                />
              </g>

              {/* Right Arm (Bicep/Tricep & Forearm) */}
              <g stroke={config.color} strokeLinecap="round">
                {/* Upper arm */}
                <line
                  x1={100 + config.shoulderWidth / 2}
                  y1="72"
                  x2={100 + config.shoulderWidth / 2 + 16}
                  y2="110"
                  strokeWidth={config.armThickness}
                />
                {/* Forearm */}
                <line
                  x1={100 + config.shoulderWidth / 2 + 16}
                  y1="110"
                  x2={100 + config.shoulderWidth / 2 + 12}
                  y2="150"
                  strokeWidth={config.armThickness * 0.8}
                />
              </g>

              {/* Pelvis/Hips */}
              <line
                x1={100 - waistWidth / 2}
                y1="130"
                x2={100 + waistWidth / 2}
                y2="130"
                stroke={config.color}
                strokeWidth="3.5"
              />

              {/* Left Leg (Thigh & Calf) */}
              <g stroke={config.color} strokeLinecap="round">
                {/* Thigh */}
                <line
                  x1={100 - waistWidth / 2 + 3}
                  y1="130"
                  x2={100 - waistWidth / 2 + 2}
                  y2="180"
                  strokeWidth={config.legThickness}
                />
                {/* Calf */}
                <line
                  x1={100 - waistWidth / 2 + 2}
                  y1="180"
                  x2={100 - waistWidth / 2 + 4}
                  y2="228"
                  strokeWidth={config.legThickness * 0.8}
                />
              </g>

              {/* Right Leg (Thigh & Calf) */}
              <g stroke={config.color} strokeLinecap="round">
                {/* Thigh */}
                <line
                  x1={100 + waistWidth / 2 - 3}
                  y1="130"
                  x2={100 + waistWidth / 2 - 2}
                  y2="180"
                  strokeWidth={config.legThickness}
                />
                {/* Calf */}
                <line
                  x1={100 + waistWidth / 2 - 2}
                  y1="180"
                  x2={100 + waistWidth / 2 - 4}
                  y2="228"
                  strokeWidth={config.legThickness * 0.8}
                />
              </g>

              {/* Joints Highlight Dots */}
              <g fill="#ffffff" stroke={config.color} strokeWidth="1">
                {/* Shoulders */}
                <circle cx={100 - config.shoulderWidth / 2} cy="72" r="3.5" />
                <circle cx={100 + config.shoulderWidth / 2} cy="72" r="3.5" />
                {/* Elbows */}
                <circle cx={100 - config.shoulderWidth / 2 - 16} cy="110" r="3" />
                <circle cx={100 + config.shoulderWidth / 2 + 16} cy="110" r="3" />
                {/* Wrists */}
                <circle cx={100 - config.shoulderWidth / 2 - 12} cy="150" r="2.5" />
                <circle cx={100 + config.shoulderWidth / 2 + 12} cy="150" r="2.5" />
                {/* Hips */}
                <circle cx={100 - waistWidth / 2 + 3} cy="130" r="3.5" />
                <circle cx={100 + waistWidth / 2 - 3} cy="130" r="3.5" />
                {/* Knees */}
                <circle cx={100 - waistWidth / 2 + 2} cy="180" r="3" />
                <circle cx={100 + waistWidth / 2 - 2} cy="180" r="3" />
                {/* Ankles */}
                <circle cx={100 - waistWidth / 2 + 4} cy="228" r="2.5" />
                <circle cx={100 + waistWidth / 2 - 4} cy="228" r="2.5" />
              </g>
            </g>
          </svg>
        </div>

        {/* Right Side: Avatar Tier Information & Stats */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
              style={{ color: config.color, borderColor: `${config.color}44`, backgroundColor: `${config.color}11` }}
            >
              Fit-Avatar Status
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1.5 flex items-center gap-1.5">
              <span>{config.name}</span>
              {config.hasCrown && <Trophy className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400" />}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {config.desc}
            </p>
          </div>

          {/* Gamified Stat Boosts Panel */}
          <div className="rounded-lg bg-slate-950/60 border border-slate-900 p-3 space-y-2">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-orange-400" />
              Active Buffs & Goals
            </p>
            <div className="grid grid-cols-2 gap-2">
              {config.boosts.map((boost, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                  <span style={{ color: config.color }}>▶</span>
                  <span>{boost}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evolution Progression Bar */}
          {config.nextTier && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>Evolusi ke: <strong>{config.nextTier}</strong></span>
                <span style={{ color: config.color }}>{config.weeksNeeded} minggu lagi</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-900">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ 
                    width: `${progressPercent}%`, 
                    backgroundColor: config.color,
                    boxShadow: `0 0 10px ${config.color}`
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
