'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, BookOpen, TrendingUp, Share2, Sparkles, CheckCircle2, AlertTriangle, Info, ChevronRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getAIWorkoutInsights } from '@/app/actions/dashboard'
import ShareWorkoutModal from '@/components/share-workout-modal'

interface RecentWorkout {
  id: number
  name: string
  date: string
  duration: number
  exercises: number
}

interface Insight {
  type: 'success' | 'warning' | 'info'
  text: string
}

interface AIInsightsData {
  hasData: boolean
  insightsList: Insight[]
  metrics: {
    exerciseProgress: { name: string; lastMonth: string; thisMonth: string; progress: string }[]
    volumeProgress: { lastMonth: string; thisMonth: string; progress: string }
    workoutFrequency: { category: string; count: number }[]
  }
}

export default function OverviewTab() {
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [shareWorkoutId, setShareWorkoutId] = useState<number | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsightsData | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(true)
  const [insightsHidden, setInsightsHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gymbro_insights_hidden') === 'true'
    }
    return false
  })

  const toggleInsights = () => {
    setInsightsHidden(prev => {
      const next = !prev
      localStorage.setItem('gymbro_insights_hidden', String(next))
      return next
    })
  }

  useEffect(() => {
    async function load() {
      try {
        const [data, insights] = await Promise.all([
          getDashboardStats(),
          getAIWorkoutInsights()
        ])
        setRecentWorkouts(data.recentWorkouts)
        setAiInsights(insights as AIInsightsData)
      } catch (err) {
        console.error('Failed to load overview data:', err)
      } finally {
        setLoading(false)
        setLoadingInsights(false)
      }
    }
    load()
  }, [])

  const maxFrequency = aiInsights?.metrics.workoutFrequency
    ? Math.max(...aiInsights.metrics.workoutFrequency.map(f => f.count), 1)
    : 1

  const insightIcon = (type: Insight['type']) => {
    if (type === 'success') return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
    if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
    return <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
  }

  const insightBg = (type: Insight['type']) => {
    if (type === 'success') return 'bg-green-950/30 border-green-800/40'
    if (type === 'warning') return 'bg-amber-950/30 border-amber-800/40'
    return 'bg-blue-950/30 border-blue-800/40'
  }

  const insightText = (type: Insight['type']) => {
    if (type === 'success') return 'text-green-300'
    if (type === 'warning') return 'text-amber-300'
    return 'text-blue-300'
  }

  const categoryColors: Record<string, string> = {
    Chest: 'bg-orange-500',
    Back: 'bg-blue-500',
    Legs: 'bg-green-500',
    Shoulders: 'bg-purple-500',
    Arms: 'bg-pink-500',
    Core: 'bg-yellow-500',
  }

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

      {/* AI Workout Insights Card */}
      {loadingInsights ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 animate-pulse">
          <div className="h-5 bg-slate-800 rounded w-40 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
          </div>
        </div>
      ) : aiInsights?.hasData ? (
        <div className="relative rounded-xl border-2 border-orange-500/30 bg-slate-900/80 overflow-hidden shadow-lg shadow-orange-950/20">
          {/* Top accent line */}
          <div className="h-0.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 w-full" />

          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-orange-500/20 blur-sm" />
                  <div className="relative rounded-lg bg-orange-500/10 border border-orange-500/30 p-2">
                    <Sparkles className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight">AI Workout Insights</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Berdasarkan data 30 hari terakhir</p>
                </div>
              </div>
              <button
                onClick={toggleInsights}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg px-2.5 py-1.5 transition-all"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${insightsHidden ? '-rotate-90' : ''}`} />
                {insightsHidden ? 'Tampilkan' : 'Sembunyikan'}
              </button>
            </div>

            {/* Collapsible body */}
            {!insightsHidden && (
              <>
                {/* Insights List */}
                <div className="space-y-2">
                  {aiInsights.insightsList.slice(0, 4).map((insight, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${insightBg(insight.type)}`}
                    >
                      {insightIcon(insight.type)}
                      <p className={`text-xs leading-relaxed font-medium ${insightText(insight.type)}`}>
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Volume Progress */}
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Volume Bulanan</p>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-500 leading-none">Bulan lalu</p>
                        <p className="text-sm font-bold text-slate-300 mt-0.5">{aiInsights.metrics.volumeProgress.lastMonth}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0 mb-0.5" />
                      <div className="text-right">
                        <p className="text-xs text-slate-500 leading-none">Bulan ini</p>
                        <p className="text-sm font-bold text-white mt-0.5">{aiInsights.metrics.volumeProgress.thisMonth}</p>
                      </div>
                    </div>
                    <div className={`mt-2 text-xs font-bold ${aiInsights.metrics.volumeProgress.progress.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {aiInsights.metrics.volumeProgress.progress}
                    </div>
                  </div>

                  {/* Frequency Chart */}
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Frekuensi Otot</p>
                    <div className="flex items-end gap-1 h-10">
                      {aiInsights.metrics.workoutFrequency.map((f) => {
                        const heightPct = maxFrequency > 0 ? (f.count / maxFrequency) * 100 : 0
                        const color = categoryColors[f.category] || 'bg-slate-500'
                        return (
                          <div key={f.category} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                            <div
                              className={`w-full rounded-t ${color} opacity-80 group-hover:opacity-100 transition-all`}
                              style={{ height: `${Math.max(heightPct, 8)}%` }}
                              title={`${f.category}: ${f.count} sesi`}
                            />
                            <span className="text-[8px] text-slate-600 truncate w-full text-center">{f.category.slice(0, 3)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Exercise Progress Table */}
                {aiInsights.metrics.exerciseProgress.length > 0 && (
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-700/50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progres Latihan</p>
                    </div>
                    <div className="divide-y divide-slate-700/30">
                      {aiInsights.metrics.exerciseProgress.slice(0, 3).map((ep, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 gap-2">
                          <p className="text-xs font-medium text-slate-300 truncate flex-1">{ep.name}</p>
                          <div className="flex items-center gap-2 shrink-0 text-right">
                            <span className="text-[11px] text-slate-500 line-through">{ep.lastMonth}</span>
                            <span className="text-[11px] font-bold text-white">{ep.thisMonth}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ep.progress.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {ep.progress}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}

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
