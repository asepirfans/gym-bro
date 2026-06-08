'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, Share2, Edit2, Check, X } from 'lucide-react'
import { getUserWorkouts, deleteWorkout, updateWorkoutName } from '@/app/actions/workouts'
import ShareWorkoutModal from '@/components/share-workout-modal'

interface Workout {
  id: number
  name: string | null
  routineName: string | null
  startedAt: Date
  completedAt: Date | null
  duration: number | null
  notes: string | null
}

export default function WorkoutsClient() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [shareWorkoutId, setShareWorkoutId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserWorkouts()
        setWorkouts(data as any)
      } catch (err) {
        console.error('Failed to load workouts:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout log?')) return
    try {
      await deleteWorkout(id)
      setWorkouts(workouts.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Failed to delete workout:', err)
    }
  }

  const handleSaveName = async (id: number) => {
    if (!editValue.trim()) return
    try {
      await updateWorkoutName(id, editValue.trim())
      setWorkouts(workouts.map((w) => w.id === id ? { ...w, name: editValue.trim() } : w))
      setEditingId(null)
    } catch (err) {
      console.error('Failed to update workout name:', err)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading workouts history...</div>
  }

  return (
    <div className="space-y-4">
      {workouts.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="mb-4 text-slate-400">No workouts logged yet</p>
          <Link href="/workouts/start">
            <Button className="bg-orange-500 hover:bg-orange-600">Log Your First Workout</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <Card key={workout.id} className="border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingId === workout.id ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-white focus:outline-none focus:border-orange-500 font-semibold"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveName(workout.id)}
                        className="text-green-400 hover:text-green-300 hover:bg-slate-800 h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="text-red-400 hover:text-red-300 hover:bg-slate-800 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {workout.name || workout.routineName || 'Quick Workout'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingId(workout.id)
                          setEditValue(workout.name || workout.routineName || 'Quick Workout')
                        }}
                        className="text-slate-400 hover:text-slate-300 p-1 rounded transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                    <span>{formatDate(workout.startedAt)}</span>
                    {workout.duration && <span>{workout.duration} min</span>}
                    {workout.notes && <span className="text-slate-300 italic">"{workout.notes}"</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShareWorkoutId(workout.id)}
                    className="text-orange-400 hover:text-orange-300 border-slate-700 hover:bg-slate-800 gap-1.5"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(workout.id)}
                    className="text-red-400 hover:text-red-300 border-slate-700 hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShareWorkoutModal
        workoutId={shareWorkoutId}
        isOpen={shareWorkoutId !== null}
        onClose={() => setShareWorkoutId(null)}
      />
    </div>
  )
}
