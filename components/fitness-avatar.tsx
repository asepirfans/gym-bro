'use client'

import Link from 'next/link'
import { CalendarCheck2 } from 'lucide-react'

export default function FitnessAvatar({ currentStreak }: { currentStreak: number }) {
  return (
    <section className="consistency-summary" aria-label="Konsistensi latihan">
      <CalendarCheck2 size={24} strokeWidth={1.5} aria-hidden="true" />
      <div><h2>{currentStreak > 0 ? `${currentStreak} minggu konsisten` : 'Kebiasaan dimulai dari satu sesi.'}</h2><p>{currentStreak > 0 ? 'Ada latihan selesai di setiap minggu streak-mu. Terus jaga ritmenya.' : 'Selesaikan latihan pertamamu minggu ini untuk memulai streak.'}</p></div>
      <Link href="/progress" className="text-link">Lihat progres</Link>
    </section>
  )
}
