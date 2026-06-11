'use client'

import { useState, useEffect } from 'react'
import { Dumbbell, Calendar, TrendingUp } from 'lucide-react'
import OverviewTab from '@/components/tabs/overview'
import { getDashboardStats } from '@/app/actions/dashboard'
import ActiveWorkoutBanner from '@/components/active-workout-banner'

export default function DashboardClient({ userId }: { userId: string }) {
  const [stats, setStats] = useState({
    workoutsCount: 0,
    routinesCount: 0,
    progressCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        setStats({
          workoutsCount: data.workoutsCount,
          routinesCount: data.routinesCount,
          progressCount: data.progressCount,
        })
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <ActiveWorkoutBanner userId={userId} />
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <a href="/workouts" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition hover:border-orange-600 hover:bg-orange-950/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-semibold">This Week Workouts</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '...' : stats.workoutsCount}
              </p>
            </div>
            <Dumbbell className="h-8 w-8 text-orange-500" />
          </div>
        </a>

        <a href="/routines" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition hover:border-blue-600 hover:bg-blue-950/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-semibold">Routines</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '...' : stats.routinesCount}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </a>

        <a href="/progress" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition hover:border-green-600 hover:bg-green-950/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-semibold">Personal Records</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '...' : stats.progressCount}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </a>
      </div>

      <div className="space-y-4">
        <OverviewTab userId={userId} />
      </div>
    </div>
  )
}

