import { forwardRef } from 'react'
import { SHARE_MUSCLES } from '@/components/workout-share-muscles'
import type { summarizeWorkout } from '@/lib/workout-share'
import { GymBroLogo } from '@/components/ui/gymbro-logo'

export const SHARE_PALETTES = {
  oat: { name: 'Oat', bg: '#f8f2e8', ink: '#342b25', muted: '#756052', accent: '#a3462e', soft: '#edddcb', line: '#ccb9a4' },
  clay: { name: 'Clay', bg: '#ad4d31', ink: '#fff9ef', muted: '#ffeddd', accent: '#fff9ef', soft: '#943c25', line: '#cf9076' },
  olive: { name: 'Olive', bg: '#e9eddf', ink: '#303c29', muted: '#56634c', accent: '#465c39', soft: '#d5ddc8', line: '#a8b797' },
  night: { name: 'Night', bg: '#211a15', ink: '#f5eadd', muted: '#c2ad9a', accent: '#e4a17d', soft: '#3d2c22', line: '#725b49' },
  transparent: { name: 'Transparan', bg: 'none', ink: '#ffffff', muted: '#ffffff', accent: '#ffffff', soft: '#ffffff', line: '#ffffff' },
}
export const SHARE_FORMATS = { post: { name: 'Post', width: 1080, height: 1350 }, story: { name: 'Story', width: 1080, height: 1920 }, square: { name: 'Persegi', width: 1080, height: 1080 } }
export type SharePalette = keyof typeof SHARE_PALETTES
export type ShareFormat = keyof typeof SHARE_FORMATS
export type ShareLayout = 'list' | 'radar' | 'heatmap' | 'combined'
const short = (value: string, max: number) => value.length > max ? value.slice(0, max - 1) + '…' : value
const number = (value: number) => value.toLocaleString('id-ID', { maximumFractionDigits: 1 })

interface Props {
  title: string
  date: string
  duration: number | null
  handle: string
  palette: SharePalette
  format: ShareFormat
  layout: ShareLayout
  summary: ReturnType<typeof summarizeWorkout>
  bodyImage?: string | null
}

export const WorkoutShareCard = forwardRef<SVGSVGElement, Props>(function WorkoutShareCard({ title, date, duration, handle, palette, format, layout, summary, bodyImage }, ref) {
  const t = SHARE_PALETTES[palette]
  const size = SHARE_FORMATS[format]
  const height = 800 * size.height / size.width
  const scale = format === 'square' ? .82 : 1
  const contentY = (height - 900 * scale) / 2
  const groups = SHARE_MUSCLES.map(g => ({ ...g, count: summary.muscles[g.categoryKey] || 0 }))
  const max = Math.max(...groups.map(g => g.count), 1)
  const angles = groups.map((_, i) => -Math.PI / 2 + i * Math.PI / 3)
  const polygon = (radius: number, data = false) => angles.map((a, i) => {
    const r = data ? radius * groups[i].count / max : radius
    return `${400 + Math.cos(a) * r},${590 + Math.sin(a) * r}`
  }).join(' ')
  const listLimit = 7
  const listY = 430
  const listX = layout === 'combined' ? 360 : 56
  const nameX = listX + 35
  return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size.width} height={size.height} viewBox={`0 0 800 ${height}`} fill="none" role="img" aria-label={`Kartu latihan: ${title}`} style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'Arial, sans-serif' }}>
    <rect width="800" height={height} fill={t.bg} />
    <g transform={`translate(${(800 - 800 * scale) / 2} ${contentY}) scale(${scale})`}>
      <GymBroLogo x="56" y="36" width="32" height="32" className="" />
      <text x="98" y="65" fill={t.ink} fontSize="30" fontWeight="800" letterSpacing="-1.5">GymBro<tspan fill={t.accent}>.</tspan></text>
      <text x="744" y="62" fill={t.muted} fontSize="13" textAnchor="end" letterSpacing="2">CATATAN LATIHAN</text>
      <line x1="56" y1="88" x2="744" y2="88" stroke={t.line} />
      <text x="56" y="132" fill={t.muted} fontSize="15">{date}</text>
      <text x="52" y="207" fill={t.ink} fontSize={title.length > 23 ? 40 : 55} fontWeight="600" fontFamily="Georgia, serif" letterSpacing="-2">{short(title || 'Latihan hari ini', 32)}</text>
      <text x="56" y="246" fill={t.accent} fontSize="17">Satu sesi lagi. Satu langkah lebih kuat.</text>
      <rect x="56" y="282" width="688" height="107" rx="14" fill={t.soft} fillOpacity={palette === 'transparent' ? .12 : 1} />
      {[
        { value: duration == null ? '—' : number(duration), label: 'MENIT' },
        { value: number(summary.volume), label: 'VOLUME · KG' },
        { value: number(summary.sets), label: 'SET SELESAI' },
      ].map((stat, i) => <g key={stat.label}><text x={80 + i * 228} y="333" fill={t.ink} fontSize="32" fontWeight="700">{stat.value}</text><text x={80 + i * 228} y="365" fill={t.muted} fontSize="11" letterSpacing="1.3">{stat.label}</text></g>)}
      {(layout === 'list' || layout === 'combined') && <g>
        <text x={listX} y={listY} fill={t.muted} fontSize="12" letterSpacing="1.5">{summary.exercises.length} GERAKAN · {number(summary.reps)} REPETISI</text>
        {summary.exercises.slice(0, listLimit).map((ex, i) => <g key={i} transform={`translate(0 ${listY + 30 + i * 47})`}>
          <text x={listX} y="0" fill={t.accent} fontSize="14">{String(i + 1).padStart(2, '0')}</text>
          <text x={nameX} y="0" fill={t.ink} fontSize={layout === 'combined' ? 16 : 18} fontWeight="600">{short(ex.name, layout === 'combined' ? 30 : 34)}</text>
          <text x={layout === 'combined' ? nameX : 744} y={layout === 'combined' ? 19 : 0} fill={t.muted} fontSize={layout === 'combined' ? 12 : 14} textAnchor={layout === 'combined' ? 'start' : 'end'}>{ex.sets} set · {ex.reps} reps{ex.bestWeight > 0 ? ` · ${number(ex.bestWeight)} kg` : ''}</text>
          <line x1={nameX} y1={layout === 'combined' ? 30 : 14} x2="744" y2={layout === 'combined' ? 30 : 14} stroke={t.line} strokeOpacity=".5" />
        </g>)}
        {summary.exercises.length > listLimit && <text x={nameX} y={listY + 35 + listLimit * 47} fill={t.muted} fontSize="13">+{summary.exercises.length - listLimit} gerakan lainnya</text>}
        {!summary.exercises.length && <text x={listX} y={listY + 45} fill={t.muted} fontSize="18">Tidak ada set tercatat.</text>}
      </g>}
      {layout === 'radar' && <g>
        {[.33, .66, 1].map(r => <polygon key={r} points={polygon(128 * r)} stroke={t.line} />)}
        {angles.map((a, i) => <line key={i} x1="400" y1="590" x2={400 + Math.cos(a) * 128} y2={590 + Math.sin(a) * 128} stroke={t.line} />)}
        <polygon points={polygon(128, true)} fill={t.accent} fillOpacity=".2" stroke={t.accent} strokeWidth="3" />
        {groups.map((g, i) => <text key={g.name} x={400 + Math.cos(angles[i]) * 169} y={596 + Math.sin(angles[i]) * 169} textAnchor="middle" fill={t.ink} fontSize="15">{g.name} · {g.count}</text>)}
      </g>}
      {(layout === 'heatmap' || layout === 'combined') && (bodyImage ? <image href={bodyImage} x="56" y={layout === 'combined' ? 450 : 410} width={layout === 'combined' ? 280 : 688} height={layout === 'combined' ? 340 : 360} preserveAspectRatio="xMidYMid meet" /> : <g transform={layout === 'combined' ? 'translate(30 460)' : 'translate(245 420)'}>
        {[75, 235].map(x => <circle key={x} cx={x} cy="30" r="12" fill={t.soft} stroke={t.line} />)}
        {groups.flatMap(g => g.paths.map((p, i) => <path key={g.name + i} d={p.d} fill={g.count ? t.accent : t.soft} fillOpacity={g.count ? .35 + .65 * g.count / max : palette === 'transparent' ? .2 : 1} stroke={t.line} strokeWidth="1" />))}
      </g>)}
      {(layout === 'radar' || layout === 'heatmap') && <text x="400" y="793" fill={t.muted} fontSize="12" textAnchor="middle">Fokus otot berdasarkan jumlah set, bukan ukuran kekuatan.</text>}
      <line x1="56" y1="830" x2="744" y2="830" stroke={t.line} />
      <text x="56" y="865" fill={t.ink} fontSize="15" fontWeight="600">{short(handle, 38)}</text>
      <text x="744" y="865" fill={t.muted} fontSize="13" textAnchor="end">Datang. Latihan. Catat.</text>
    </g>
  </svg>
})
