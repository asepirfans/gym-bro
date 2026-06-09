'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Plus, X, Play, Pause, Timer, Volume2 } from 'lucide-react'
import { getRoutineExercises } from '@/app/actions/routines'
import { getExercises } from '@/app/actions/exercises'
import { saveWorkout, getPreviousWorkoutSets } from '@/app/actions/workouts'
import { useToast } from '@/components/toast-provider'

interface Set {
  setNumber: number
  reps?: number
  weight?: string
  completed: boolean
  previousReps?: number
  previousWeight?: string
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
  const { warning, error: toastError, success, confirm } = useToast()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [actualStartTime, setActualStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [elapsedTime, setElapsedTime] = useState('00:00')
  const [currentExerciseId, setCurrentExerciseId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAddExerciseId, setSelectedAddExerciseId] = useState('')
  const [notes, setNotes] = useState('')

  // Rest Timer State
  const [restTimeRemaining, setRestTimeRemaining] = useState(0)
  const [defaultRestDuration, setDefaultRestDuration] = useState(90) // default 90 seconds
  const [isRestActive, setIsRestActive] = useState(false)
  const [isRestPaused, setIsRestPaused] = useState(false)
  const [autoRestEnabled, setAutoRestEnabled] = useState(true)

  // Audio & Vibration helpers
  const playRestChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const now = ctx.currentTime
      
      // Professional high-pitch chime: two quick clean synth beeps (A5 then C6)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now) // A5
      osc.frequency.setValueAtTime(1046.5, now + 0.15) // C6
      
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now)
      osc.stop(now + 0.35)
    } catch (e) {
      console.error('Web Audio chime failed:', e)
    }
  }

  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }

  // Countdown Timer useEffect
  useEffect(() => {
    if (!isRestActive || isRestPaused || restTimeRemaining <= 0) return

    const timer = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRestActive(false)
          playRestChime()
          triggerVibration()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRestActive, isRestPaused, restTimeRemaining])

  const startWorkout = () => {
    setWorkoutStarted(true)
    setActualStartTime(new Date())
    setElapsedSeconds(0)
  }

  useEffect(() => {
    if (!workoutStarted) return

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [workoutStarted])

  useEffect(() => {
    const hrs = Math.floor(elapsedSeconds / 3600)
    const mins = Math.floor((elapsedSeconds % 3600) / 60)
    const secs = elapsedSeconds % 60

    const hrsStr = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''
    const minsStr = mins.toString().padStart(2, '0')
    const secsStr = secs.toString().padStart(2, '0')

    setElapsedTime(`${hrsStr}${minsStr}:${secsStr}`)
  }, [elapsedSeconds])

  // Persistent active workout prompt state
  const [resumePromptVisible, setResumePromptVisible] = useState(false)
  const [savedWorkoutData, setSavedWorkoutData] = useState<any>(null)

  const loadTemplate = async () => {
    setLoading(true)
    try {
      // Fetch all exercises from DB for the adding dropdown
      const allExs = await getExercises()
      setDbExercises(allExs as any)

      if (routineId) {
        // Fetch routine exercises
        const routineExs = await getRoutineExercises(routineId)
        const mapped: Exercise[] = await Promise.all(
          routineExs.map(async (re) => {
            let prevSets: any[] = []
            try {
              prevSets = await getPreviousWorkoutSets(re.id)
            } catch (e) {
              console.error('Failed to get previous sets for routine exercise:', e)
            }

            const defaultSets: Set[] = []
            const setLimit = re.sets || 3
            for (let s = 1; s <= setLimit; s++) {
              const prevSet = prevSets[s - 1]
              defaultSets.push({
                setNumber: s,
                reps: re.reps || 10,
                weight: re.weight ? re.weight.toString() : undefined,
                completed: false,
                previousReps: prevSet?.reps || undefined,
                previousWeight: prevSet?.weight ? prevSet.weight.toString() : undefined,
              })
            }
            return {
              id: re.id,
              name: re.name,
              targetSets: setLimit,
              sets: defaultSets,
            }
          })
        )
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

  useEffect(() => {
    const saved = localStorage.getItem('gymbro_active_workout')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.workoutStarted) {
          setSavedWorkoutData(parsed)
          setResumePromptVisible(true)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to parse saved workout:', e)
      }
    }
    loadTemplate()
  }, [routineId])

  const handleResumeWorkout = async () => {
    if (!savedWorkoutData) return
    setLoading(true)
    try {
      const allExs = await getExercises()
      setDbExercises(allExs as any)

      setExercises(savedWorkoutData.exercises || [])
      setNotes(savedWorkoutData.notes || '')
      if (savedWorkoutData.actualStartTime) {
        setActualStartTime(new Date(savedWorkoutData.actualStartTime))
      }
      setElapsedSeconds(savedWorkoutData.elapsedSeconds || 0)
      setWorkoutStarted(savedWorkoutData.workoutStarted)
      if (savedWorkoutData.exercises && savedWorkoutData.exercises.length > 0) {
        setCurrentExerciseId(savedWorkoutData.exercises[0].id)
      }
    } catch (e) {
      console.error('Failed to resume workout:', e)
    } finally {
      setResumePromptVisible(false)
      setLoading(false)
    }
  }

  const handleDiscardSavedWorkout = () => {
    localStorage.removeItem('gymbro_active_workout')
    setResumePromptVisible(false)
    loadTemplate()
  }

  // Autosave active workout state to localStorage
  useEffect(() => {
    if (workoutStarted && exercises.length > 0 && !workoutCompleted) {
      localStorage.setItem(
        'gymbro_active_workout',
        JSON.stringify({
          routineId,
          exercises,
          notes,
          actualStartTime: actualStartTime ? actualStartTime.toISOString() : null,
          elapsedSeconds,
          workoutStarted,
        })
      )
    }
  }, [exercises, notes, actualStartTime, elapsedSeconds, workoutStarted, routineId, workoutCompleted])

  const addExerciseToLog = async () => {
    if (!selectedAddExerciseId) return
    const dbEx = dbExercises.find((e) => e.id === parseInt(selectedAddExerciseId))
    if (!dbEx) return

    // Prevent duplicate exercises
    if (exercises.some((e) => e.id === dbEx.id)) {
      warning('Sudah ditambahkan', 'Exercise ini sudah ada di daftar latihan.')
      return
    }

    let prevSets: any[] = []
    try {
      prevSets = await getPreviousWorkoutSets(dbEx.id)
    } catch (e) {
      console.error('Failed to get previous sets for exercise:', e)
    }

    const defaultSets: Set[] = []
    const setLimit = prevSets.length > 0 ? prevSets.length : 3
    for (let s = 1; s <= setLimit; s++) {
      const prevSet = prevSets[s - 1]
      defaultSets.push({
        setNumber: s,
        completed: false,
        previousReps: prevSet?.reps || undefined,
        previousWeight: prevSet?.weight ? prevSet.weight.toString() : undefined,
      })
    }

    const newEx: Exercise = {
      id: dbEx.id,
      name: dbEx.name,
      targetSets: setLimit,
      sets: defaultSets,
    }

    setExercises([...exercises, newEx])
    if (currentExerciseId === null) {
      setCurrentExerciseId(newEx.id)
    }
    setSelectedAddExerciseId('')
  }

  const addSet = async (exerciseId: number) => {
    let prevSets: any[] = []
    try {
      prevSets = await getPreviousWorkoutSets(exerciseId)
    } catch (e) {
      console.error('Failed to get previous sets for adding set:', e)
    }

    setExercises((prevExercises) =>
      prevExercises.map((ex) => {
        if (ex.id === exerciseId) {
          const nextSetNumber = ex.sets.length + 1
          const lastSet = ex.sets[ex.sets.length - 1]
          const prevSet = prevSets[nextSetNumber - 1] || prevSets[prevSets.length - 1]
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                setNumber: nextSetNumber,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight,
                completed: false,
                previousReps: prevSet?.reps || undefined,
                previousWeight: prevSet?.weight ? prevSet.weight.toString() : undefined,
              },
            ],
          }
        }
        return ex
      }),
    )
  }

  const updateSet = (exerciseId: number, setIndex: number, field: keyof Set, value: any) => {
    if (field === 'completed' && value === true) {
      if (!workoutStarted) {
        startWorkout()
      }

      // Trigger rest timer if enabled
      if (autoRestEnabled) {
        setRestTimeRemaining(defaultRestDuration)
        setIsRestActive(true)
        setIsRestPaused(false)
      }

      setExercises((prevExercises) =>
        prevExercises.map((ex) => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map((set, index) => {
                if (index === setIndex) {
                  const reps = set.reps || set.previousReps || 10
                  const weight = set.weight || set.previousWeight || ''
                  return {
                    ...set,
                    reps,
                    weight,
                    completed: true,
                  }
                }
                return set
              }),
            }
          }
          return ex
        })
      )
      return
    }

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
    // Only count exercises that have at least one completed set with reps
    const hasCompletedSets = exercises.some((ex) =>
      ex.sets.some((s) => s.completed && (s.reps ?? 0) > 0)
    )
    if (!hasCompletedSets) {
      warning('Belum ada set selesai', 'Selesaikan minimal satu set (centang ✓) sebelum mengakhiri workout.')
      return
    }

    setSaving(true)
    try {
      const endTime = new Date()
      const start = actualStartTime || endTime
      const duration = Math.max(1, Math.round((endTime.getTime() - start.getTime()) / 60000)) // minutes

      // Only include exercises that have at least one completed set with actual reps
      const completedExercises = exercises
        .map((ex) => ({
          exerciseId: ex.id,
          sets: ex.sets
            .filter((s) => s.completed && (s.reps ?? 0) > 0)
            .map((s) => ({
              setNumber: s.setNumber,
              reps: s.reps!,
              weight: s.weight || undefined,
            })),
        }))
        .filter((ex) => ex.sets.length > 0) // drop exercises with no completed sets

      await saveWorkout({
        routineId,
        duration,
        notes: notes || undefined,
        completedExercises,
      })

      // Mark as completed FIRST to prevent autosave from re-writing localStorage
      setWorkoutCompleted(true)
      localStorage.removeItem('gymbro_active_workout')

      router.push('/workouts')
      router.refresh()
    } catch (err) {
      console.error('Failed to save workout:', err)
      toastError('Gagal menyimpan', 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }


  const completedSets = exercises.reduce((total, ex) => total + ex.sets.filter((s) => s.completed).length, 0)
  const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0)

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading workout...</div>
  }

  if (resumePromptVisible) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 max-w-md mx-auto my-12 shadow-xl border-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            Workout Aktif Ditemukan
          </CardTitle>
          <CardDescription className="text-slate-400">
            Anda memiliki sesi workout sebelumnya yang belum selesai. Apakah Anda ingin melanjutkannya?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-800 p-4 border border-slate-700/50">
            <p className="font-semibold text-white">
              {savedWorkoutData?.exercises?.length || 0} Latihan dalam progress
            </p>
            {savedWorkoutData?.actualStartTime && (
              <p className="text-xs text-slate-400 mt-1">
                Dimulai pada: {new Date(savedWorkoutData.actualStartTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDiscardSavedWorkout}
              variant="outline"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Mulai Baru
            </Button>
            <Button
              onClick={handleResumeWorkout}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              Lanjutkan
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = exercises.find((e) => e.id === currentExerciseId)

  const filteredExercises = dbExercises.filter((ex) => {
    if (!selectedCategory) return true
    return ex.category.toLowerCase() === selectedCategory.toLowerCase()
  })

  return (
    <div className="space-y-6">
      {/* Progress & Live Timer */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {workoutStarted ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                )}
                <p className="text-sm text-slate-400 leading-none font-medium">Workout Time</p>
              </div>
              <p className={`text-3xl font-bold tabular-nums ${workoutStarted ? 'text-white' : 'text-slate-500'}`}>
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

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRestTimeRemaining(defaultRestDuration)
                  setIsRestActive(true)
                  setIsRestPaused(false)
                }}
                className="gap-1.5 border-slate-700 hover:bg-slate-800 text-slate-300 h-8 text-xs"
              >
                <Timer className="h-3.5 w-3.5 text-orange-500" />
                Start Rest ({defaultRestDuration}s)
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Auto-Rest Timer:</span>
              <button
                type="button"
                onClick={() => setAutoRestEnabled(!autoRestEnabled)}
                className={`text-xs px-2 py-0.5 rounded font-bold border transition-colors ${
                  autoRestEnabled
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {autoRestEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add exercise dropdown */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedAddExerciseId('') // Reset selected exercise when category changes
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white capitalize text-sm sm:w-48 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Categories</option>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="legs">Legs</option>
            <option value="shoulders">Shoulders</option>
            <option value="arms">Arms</option>
            <option value="core">Core</option>
          </select>

          <div className="flex flex-1 gap-2">
            <select
              value={selectedAddExerciseId}
              onChange={(e) => setSelectedAddExerciseId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white capitalize text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Choose exercise to add...</option>
              {filteredExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <Button onClick={addExerciseToLog} className="gap-2 bg-orange-500 hover:bg-orange-600 shrink-0">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
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
                    <p className="mb-2 text-sm text-slate-400 font-semibold">
                      Set {set.setNumber}
                      {set.previousWeight && set.previousReps && (
                        <span className="text-xs text-slate-500 italic ml-2">
                          Last: {parseFloat(set.previousWeight)}kg x {set.previousReps} reps
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Reps</label>
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(exercise.id, index, 'reps', e.target.value ? parseInt(e.target.value) : '')}
                          placeholder={set.previousReps ? `${set.previousReps}` : 'Reps'}
                          className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Weight (kg)</label>
                        <input
                          type="text"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(exercise.id, index, 'weight', e.target.value)}
                          placeholder={set.previousWeight ? `${parseFloat(set.previousWeight)}` : 'Weight'}
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

      {/* Start / Finish / Cancel Workout */}
      {exercises.length > 0 && (
        !workoutStarted ? (
          <Button
            onClick={startWorkout}
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold text-white transition-all"
          >
            Start Workout
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => {
                confirm({
                  title: 'Batalkan Workout?',
                  message: 'Semua progres latihan aktif saat ini akan hilang dan tidak bisa dikembalikan.',
                  danger: true,
                  onConfirm: () => {
                    setWorkoutCompleted(true)
                    localStorage.removeItem('gymbro_active_workout')
                    router.push('/workouts')
                    router.refresh()
                  }
                })
              }}
              variant="outline"
              className="border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-950/20 px-6 h-12 text-base font-semibold transition-all shrink-0"
            >
              Batal
            </Button>
            <Button
              onClick={finishWorkout}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg font-bold text-white transition-all"
            >
              {saving ? 'Saving...' : 'Finish Workout'}
            </Button>
          </div>
        )
      )}

      {/* Rest Timer Floating Overlay */}
      {isRestActive && restTimeRemaining > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[340px] px-4 sm:px-0 transition-all duration-300 animate-in slide-in-from-bottom-5">
          <Card className="border-orange-500/80 bg-slate-950/95 shadow-lg shadow-orange-950/40 border-2 overflow-hidden backdrop-blur-md">
            {/* Top accent glow line */}
            <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 w-full" />
            
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-orange-500 animate-pulse" />
                  <span className="font-bold text-white tracking-wide text-sm uppercase">Rest Timer</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] uppercase text-slate-400 font-semibold cursor-pointer select-none" htmlFor="autoRestToggle">
                    Auto-Rest
                  </label>
                  <input
                    id="autoRestToggle"
                    type="checkbox"
                    checked={autoRestEnabled}
                    onChange={(e) => setAutoRestEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-orange-500 focus:ring-orange-500/50 bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Digital Countdown and Progress bar */}
              <div className="relative pt-2 text-center">
                <div className="text-4xl font-extrabold text-white font-mono tracking-widest tabular-nums drop-shadow-[0_2px_8px_rgba(249,115,22,0.3)]">
                  {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
                </div>
                
                {/* Progress Bar Container */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3.5 border border-slate-700/50">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(restTimeRemaining / defaultRestDuration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  onClick={() => setRestTimeRemaining((prev) => Math.max(0, prev - 30))}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium hover:text-white"
                >
                  -30s
                </Button>

                <Button
                  onClick={() => setIsRestPaused(!isRestPaused)}
                  variant="default"
                  size="sm"
                  className={`h-9 px-4 font-bold text-white shrink-0 shadow-sm ${
                    isRestPaused 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {isRestPaused ? (
                    <Play className="h-4 w-4 mr-1.5 fill-white" />
                  ) : (
                    <Pause className="h-4 w-4 mr-1.5 fill-white" />
                  )}
                  {isRestPaused ? 'Resume' : 'Pause'}
                </Button>

                <Button
                  onClick={() => setRestTimeRemaining((prev) => prev + 30)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium hover:text-white"
                >
                  +30s
                </Button>

                <Button
                  onClick={() => {
                    setIsRestActive(false)
                    setRestTimeRemaining(0)
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-400 hover:text-red-300 border-red-950/50 bg-red-950/10 hover:bg-red-950/20"
                >
                  Skip
                </Button>
              </div>

              {/* Presets Settings */}
              <div className="border-t border-slate-800 pt-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 text-center tracking-wider">Default Duration</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[60, 90, 120, 180].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        setDefaultRestDuration(dur)
                        setRestTimeRemaining(dur)
                        setIsRestPaused(false)
                      }}
                      className={`py-1 text-[11px] font-bold rounded transition-colors ${
                        defaultRestDuration === dur
                          ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
