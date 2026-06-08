'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Plus, X } from 'lucide-react'
import { getRoutineExercises } from '@/app/actions/routines'
import { getExercises } from '@/app/actions/exercises'
import { saveWorkout } from '@/app/actions/workouts'

interface Set {
  setNumber: number
  reps?: number
  weight?: string
  completed: boolean
}

interface Exercise {
  id: number
  name: string
  targetSets: number
  sets: Set[]
}

interface DbExercise {
  id: number
  name: string
  category: string
}

export default function WorkoutLogger() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const routineIdStr = searchParams.get('routineId')
  const routineId = routineIdStr ? parseInt(routineIdStr) : undefined

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])
  const [startTime] = useState(new Date())
  const [elapsedTime, setElapsedTime] = useState('00:00')
  const [currentExerciseId, setCurrentExerciseId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedAddExerciseId, setSelectedAddExerciseId] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diffSecs = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const hrs = Math.floor(diffSecs / 3600)
      const mins = Math.floor((diffSecs % 3600) / 60)
      const secs = diffSecs % 60

      const hrsStr = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''
      const minsStr = mins.toString().padStart(2, '0')
      const secsStr = secs.toString().padStart(2, '0')

      setElapsedTime(`${hrsStr}${minsStr}:${secsStr}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  useEffect(() => {
    async function load() {
      try {
        // Fetch all exercises from DB for the adding dropdown
        const allExs = await getExercises()
        setDbExercises(allExs as any)

        if (routineId) {
          // Fetch routine exercises
          const routineExs = await getRoutineExercises(routineId)
          const mapped: Exercise[] = routineExs.map((re) => {
            const defaultSets: Set[] = []
            const setLimit = re.sets || 3
            for (let s = 1; s <= setLimit; s++) {
              defaultSets.push({
                setNumber: s,
                reps: re.reps || 10,
                weight: re.weight ? re.weight.toString() : undefined,
                completed: false,
              })
            }
            return {
              id: re.id,
              name: re.name,
              targetSets: setLimit,
              sets: defaultSets,
            }
          })
          setExercises(mapped)
          if (mapped.length > 0) {
            setCurrentExerciseId(mapped[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load workout template:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [routineId])

  const addExerciseToLog = () => {
    if (!selectedAddExerciseId) return
    const dbEx = dbExercises.find((e) => e.id === parseInt(selectedAddExerciseId))
    if (!dbEx) return

    // Prevent duplicate exercises
    if (exercises.some((e) => e.id === dbEx.id)) {
      alert('This exercise is already added')
      return
    }

    const newEx: Exercise = {
      id: dbEx.id,
      name: dbEx.name,
      targetSets: 3,
      sets: [{ setNumber: 1, completed: false }],
    }

    setExercises([...exercises, newEx])
    if (currentExerciseId === null) {
      setCurrentExerciseId(newEx.id)
    }
    setSelectedAddExerciseId('')
  }

  const addSet = (exerciseId: number) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const nextSetNumber = ex.sets.length + 1
          const lastSet = ex.sets[ex.sets.length - 1]
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                setNumber: nextSetNumber,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight,
                completed: false,
              },
            ],
          }
        }
        return ex
      }),
    )
  }

  const updateSet = (exerciseId: number, setIndex: number, field: keyof Set, value: any) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set, index) => (index === setIndex ? { ...set, [field]: value } : set)),
          }
        }
        return ex
      }),
    )
  }

  const removeSet = (exerciseId: number, setIndex: number) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const filtered = ex.sets.filter((_, index) => index !== setIndex)
          // Re-index set numbers
          const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }))
          return {
            ...ex,
            sets: reindexed,
          }
        }
        return ex
      }),
    )
  }

  const finishWorkout = async () => {
    const hasSets = exercises.some((ex) => ex.sets.length > 0)
    if (!hasSets) {
      alert('Please add at least one set to finish your workout')
      return
    }

    setSaving(true)
    try {
      const endTime = new Date()
      const duration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 60000)) // minutes

      // Construct completed exercises structure
      const completedExercises = exercises.map((ex) => ({
        exerciseId: ex.id,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps || 0,
          weight: s.weight || undefined,
        })),
      }))

      await saveWorkout({
        routineId,
        duration,
        notes: notes || undefined,
        completedExercises,
      })

      router.push('/workouts')
      router.refresh()
    } catch (err) {
      console.error('Failed to save workout:', err)
      alert('Failed to save workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const completedSets = exercises.reduce((total, ex) => total + ex.sets.filter((s) => s.completed).length, 0)
  const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0)

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading workout...</div>
  }

  const currentExercise = exercises.find((e) => e.id === currentExerciseId)

  return (
    <div className="space-y-6">
      {/* Progress & Live Timer */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Workout Time</p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {elapsedTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Sets Completed</p>
              <p className="text-3xl font-bold text-white">
                {completedSets} / {totalSets}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-orange-500 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-orange-400">
                {totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add exercise dropdown */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6 flex gap-2">
          <select
            value={selectedAddExerciseId}
            onChange={(e) => setSelectedAddExerciseId(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white capitalize"
          >
            <option value="">Add exercise to workout...</option>
            {dbExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.category})
              </option>
            ))}
          </select>
          <Button onClick={addExerciseToLog} className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className={`border-slate-800 ${exercise.id === currentExerciseId ? 'bg-orange-950/10 border-orange-600' : 'bg-slate-900/50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">{exercise.name}</CardTitle>
                </div>
                <Button
                  onClick={() => setCurrentExerciseId(exercise.id)}
                  variant={exercise.id === currentExerciseId ? 'default' : 'outline'}
                  size="sm"
                  className={exercise.id === currentExerciseId ? 'bg-orange-500 hover:bg-orange-600' : 'border-slate-700'}
                >
                  Focus
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {exercise.sets.map((set, index) => (
                <div key={index} className="flex items-end gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <div className="flex-1">
                    <p className="mb-2 text-sm text-slate-400 font-semibold">Set {set.setNumber}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Reps</label>
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(exercise.id, index, 'reps', e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="Reps"
                          className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Weight (kg)</label>
                        <input
                          type="text"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(exercise.id, index, 'weight', e.target.value)}
                          placeholder="Weight"
                          className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 invisible select-none">Status</label>
                        <Button
                          onClick={() => updateSet(exercise.id, index, 'completed', !set.completed)}
                          size="sm"
                          variant={set.completed ? 'default' : 'outline'}
                          className={set.completed ? 'bg-green-600 hover:bg-green-700 text-white w-full h-9' : 'border-slate-700 w-full h-9'}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeSet(exercise.id, index)}
                    size="sm"
                    variant="outline"
                    className="text-red-400 hover:text-red-300 border-slate-700 h-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={() => addSet(exercise.id)} variant="outline" className="w-full gap-2 border-slate-700 hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Add Set
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout Notes */}
      {exercises.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="pt-6 space-y-2">
            <label className="text-sm font-medium text-slate-300">Workout Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Felt great today, hit PR on bench!"
              className="w-full min-h-[80px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Finish */}
      {exercises.length > 0 && (
        <Button onClick={finishWorkout} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold text-white transition-all">
          {saving ? 'Saving...' : 'Finish Workout'}
        </Button>
      )}
    </div>
  )
}
