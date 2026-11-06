'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dumbbell, BookOpen, TrendingUp, Share2 } from 'lucide-react'
import Link from 'next/link'
import type { getDashboardStats } from '@/app/actions/dashboard'
import ShareWorkoutModal from '@/components/share-workout-modal'
import FitnessAvatar from '@/components/fitness-avatar'

export default function OverviewTab({ stats, loading }: {
  stats: Awaited<ReturnType<typeof getDashboardStats>> | null
  loading: boolean
}) {
  const recentWorkouts = stats?.recentWorkouts ?? []
  const streak = stats?.streak ?? null
  const [shareWorkoutId, setShareWorkoutId] = useState<number | null>(null)
  return (
    <div className="space-y-6">
      {loading ? (
        <Card className="border-slate-800 bg-slate-900/50 p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-slate-800 p-3 w-12 h-12" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        </Card>
      ) : (
        streak && (
          <FitnessAvatar currentStreak={streak.currentStreak} />
        )
      )}

      <div className="flex flex-wrap items-center gap-6 py-2">
        <Link href="/routines/new" className="text-link inline-flex items-center gap-2"><BookOpen size={16} aria-hidden="true" /> Susun rutinitas baru</Link>
        <Link href="/exercises" className="text-link inline-flex items-center gap-2"><Dumbbell size={16} aria-hidden="true" /> Cari gerakan latihan</Link>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Sesi terakhir</h3>
          <Link href="/workouts">
            <Button variant="ghost" size="sm" className="border-slate-700 hover:bg-slate-800">
              Semua sesi
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center text-slate-400 py-6">Loading workouts...</div>
        ) : recentWorkouts.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400 text-sm">
            Belum ada sesi tercatat. Latihan yang kamu selesaikan akan muncul di sini.
          </Card>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((workout) => (
              <Card key={workout.id} className="border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{workout.name}</p>
                    <p className="text-sm text-slate-400">{workout.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-300">
                        {workout.duration < 60
                          ? `${workout.duration} min`
                          : `${Math.floor(workout.duration / 60)} jam${workout.duration % 60 > 0 ? ` ${workout.duration % 60} min` : ''}`}
                      </p>
                      <p className="text-xs text-slate-500">{workout.exercises} sets</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShareWorkoutId(workout.id)}
                      aria-label={`Bagikan latihan ${workout.name}`}
                      className="text-orange-400 hover:text-orange-300 hover:bg-slate-800 h-9 w-9 rounded-lg"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/exercises">
          <Button variant="outline" className="w-full border-slate-700 gap-2 hover:bg-slate-800">
            <BookOpen className="h-4 w-4" />
            Library gerakan
          </Button>
        </Link>
        <Link href="/progress">
          <Button variant="outline" className="w-full border-slate-700 gap-2 hover:bg-slate-800">
            <TrendingUp className="h-4 w-4" />
            Lihat progres
          </Button>
        </Link>
      </div>

      <ShareWorkoutModal
        workoutId={shareWorkoutId}
        isOpen={shareWorkoutId !== null}
        onClose={() => setShareWorkoutId(null)}
      />
    </div>
  )
}
