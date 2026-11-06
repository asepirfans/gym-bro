'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight, Clock3, Dumbbell } from 'lucide-react'
import { getUserWorkouts } from '@/app/actions/workouts'
import { calendarDays, localDateKey } from '@/lib/workout-calendar'

export interface CalendarWorkout {
  id: number
  name: string | null
  startedAt: Date | string
  completedAt: Date | string | null
  duration: number | null
}

export default function WorkoutCalendar({ workouts: supplied }: { workouts?: CalendarWorkout[] }) {
  const [fetchedWorkouts, setWorkouts] = useState<CalendarWorkout[]>([])
  const workouts = supplied ?? fetchedWorkouts
  const [month, setMonth] = useState<Date | null>(null)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(!supplied)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const now = new Date()
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelected(localDateKey(now))
  }, [])

  useEffect(() => {
    if (supplied) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(false)
    getUserWorkouts().then(data => {
      if (!cancelled) setWorkouts(data)
    }).catch(() => {
      if (!cancelled) setError(true)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [supplied, retry])

  const completed = workouts.filter(workout => workout.completedAt)
  const byDay = new Map<string, CalendarWorkout[]>()
  for (const workout of completed) {
    const key = localDateKey(workout.startedAt)
    byDay.set(key, [...(byDay.get(key) || []), workout])
  }
  const sessions = byDay.get(selected) || []
  const days = month ? calendarDays(month.getFullYear(), month.getMonth()) : []
  const monthPrefix = month ? localDateKey(month).slice(0, 7) : ''
  const activeDays = month ? [...byDay.keys()].filter(key => key.startsWith(monthPrefix)).length : 0
  const today = localDateKey(new Date())
  const move = (direction: number) => {
    if (!month) return
    const next = new Date(month.getFullYear(), month.getMonth() + direction, 1)
    setMonth(next)
    setSelected(localDateKey(next))
  }

  return (
    <section className="training-calendar" aria-label="Kalender progres latihan" aria-busy={loading}>
      <div className="calendar-heading">
        <div>
          <h2>Kalender latihan</h2>
          {loading && <p className="calendar-subtitle">Memuat riwayat...</p>}
        </div>
        <div className="calendar-summary" aria-label={month ? `${activeDays} hari latihan pada bulan yang ditampilkan` : 'Menyiapkan kalender'}><strong>{loading || !month ? '…' : activeDays}</strong><span>hari latihan</span></div>
      </div>
      {error ? <div role="alert" className="calendar-error">Riwayat belum bisa dimuat. <button onClick={() => setRetry(value => value + 1)}>Coba lagi</button></div> : (
        <div className="calendar-layout">
          <div>
            <div className="calendar-month-nav">
              <button aria-label="Bulan sebelumnya" onClick={() => move(-1)}><ChevronLeft size={18} /></button>
              <h3 aria-live="polite">{month?.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) || 'Kalender'}</h3>
              <button aria-label="Bulan berikutnya" onClick={() => move(1)}><ChevronRight size={18} /></button>
              <button className="calendar-today" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(localDateKey(now)) }}>Hari ini</button>
            </div>
            <div className="calendar-grid month-enter" key={month ? localDateKey(month) : 'loading'}>
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => <span className="calendar-weekday" key={day}>{day}</span>)}
              {days.map((date, index) => {
                if (!date) return <span key={`blank-${index}`} />
                const key = localDateKey(date)
                const count = byDay.get(key)?.length || 0
                return <button key={key} style={{ '--stamp-delay': `${(index % 7) * 35}ms` } as CSSProperties} className={`calendar-day ${count ? 'has-workout' : ''} ${key === selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''}`} aria-pressed={key === selected} aria-current={key === today ? 'date' : undefined} aria-label={`${date.toLocaleDateString('id-ID', { dateStyle: 'full' })}, ${count} sesi selesai`} onClick={() => setSelected(key)}>
                  <span>{date.getDate()}</span>{count > 0 && <Check className="calendar-check" size={12} strokeWidth={3} aria-hidden="true" />}
                </button>
              })}
            </div>
            <p className="calendar-legend"><span><Check size={12} /> Latihan selesai</span><span className="today-key" /> Hari ini</p>
          </div>
          <div className="calendar-detail" aria-live="polite">
            <h3>{selected && new Date(`${selected}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            {loading ? <p className="calendar-subtitle" role="status">Memuat sesi...</p> : sessions.length ? <div className="calendar-sessions">{sessions.map(session => <div className="calendar-session" key={session.id}>
              <Dumbbell size={18} aria-hidden="true" /><div><h4>{session.name || 'Latihan bebas'}</h4><p><Clock3 size={13} />{session.duration || 0} menit <span>·</span> {new Date(session.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p></div><Check size={16} aria-label="Selesai" />
            </div>)}</div> : <div className="calendar-empty"><p>Tidak ada latihan.</p>{selected === today && <Link href="/workouts/start" className="text-link">Mulai latihan</Link>}</div>}
            <p className="calendar-footnote"><Link href="/workouts" className="text-link">Semua sesi</Link></p>
          </div>
        </div>
      )}
    </section>
  )
}
