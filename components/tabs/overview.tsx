'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, BookOpen, TrendingUp, Share2 } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats } from '@/app/actions/dashboard'
import ShareWorkoutModal from '@/components/share-workout-modal'

interface RecentWorkout {
  id: number
  name: string
  date: string
  duration: number
  exercises: number
}

export default function OverviewTab() {
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [shareWorkoutId, setShareWorkoutId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        setRecentWorkouts(data.recentWorkouts)
      } catch (err) {
        console.error('Failed to load recent workouts:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/workouts/start">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition hover:border-orange-600 hover:bg-orange-950/10 cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Start Workout</h3>
                <p className="mt-1 text-sm text-slate-400">Log your workout session</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/routines/new">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition hover:border-blue-600 hover:bg-blue-950/10 cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Create Routine</h3>
                <p className="mt-1 text-sm text-slate-400">Build a workout routine</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Workouts</h3>
          <Link href="/workouts">
            <Button variant="ghost" size="sm" className="border-slate-700 hover:bg-slate-800">
              View all
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center text-slate-400 py-6">Loading workouts...</div>
        ) : recentWorkouts.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400 text-sm">
            No workouts logged yet. Click Start Workout above to begin!
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
                      <p className="text-sm text-slate-300">{workout.duration} min</p>
                      <p className="text-xs text-slate-500">{workout.exercises} sets</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShareWorkoutId(workout.id)}
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
            Exercise Library
          </Button>
        </Link>
        <Link href="/progress">
          <Button variant="outline" className="w-full border-slate-700 gap-2 hover:bg-slate-800">
            <TrendingUp className="h-4 w-4" />
            View Progress
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
