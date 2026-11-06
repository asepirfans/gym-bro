'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import { getExercises } from '@/app/actions/exercises'
import { createRoutine, addExerciseToRoutine } from '@/app/actions/routines'
import { useToast } from '@/components/toast-provider'

interface DbExercise {
  id: number
  name: string
  category: string
}

interface RoutineExercise {
  exerciseId: number
  exerciseName: string
  sets: number
  reps?: number
  weight?: string
}

export default function RoutineBuilder() {
  const router = useRouter()
  const { warning, error: toastError, success } = useToast()
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])
  const [routineName, setRoutineName] = useState('')
  const [routineDescription, setRoutineDescription] = useState('')
  const [exercises, setExercises] = useState<RoutineExercise[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getExercises()
        setDbExercises(data as any)
      } catch (err) {
        console.error('Failed to fetch exercises:', err)
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [])

  const addExercise = () => {
    if (!selectedExerciseId) return

    const exercise = dbExercises.find((e) => e.id === parseInt(selectedExerciseId))
    if (!exercise) return

    // Prevent duplicate exercises in builder for simplicity
    if (exercises.some((e) => e.exerciseId === exercise.id)) {
      warning('Sudah ditambahkan', 'Exercise ini sudah ada di rutinitas.')
      return
    }

    const newExercise: RoutineExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
    }

    setExercises([...exercises, newExercise])
    setSelectedExerciseId('')
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: string, value: string | number) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSave = async () => {
    if (!routineName || exercises.length === 0) {
      warning('Rutinitas belum lengkap', 'Masukkan nama rutinitas dan tambahkan minimal satu exercise.')
      return
    }

    setLoading(true)
    try {
      // 1. Create Routine
      const newRoutine = await createRoutine({
        name: routineName,
        description: routineDescription || undefined,
      })

      // 2. Add Exercises
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i]
        await addExerciseToRoutine({
          routineId: newRoutine.id,
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || undefined,
          orderIndex: i,
        })
      }

      router.push('/routines')
      router.refresh()
    } catch (err) {
      console.error('Failed to create routine:', err)
      toastError('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan rutinitas.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div role="status" className="text-center text-slate-400 py-12">Menyiapkan ruang rutinitasmu...</div>
  }

  const filteredExercises = dbExercises.filter((ex) => {
    if (!selectedCategory) return true
    return ex.category.toLowerCase() === selectedCategory.toLowerCase()
  })

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Kenalan dengan rutinitasmu</CardTitle>
          <CardDescription>Beri nama yang gampang kamu ingat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama rutinitas</Label>
            <Input
              id="name"
              placeholder="Contoh: Upper body santai"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="bg-slate-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Catatan singkat (opsional)</Label>
            <Input
              id="description"
              placeholder="Contoh: Dada, bahu, dan trisep"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
              className="bg-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Gerakan pilihanmu</CardTitle>
          <CardDescription>Tambahkan gerakan, lalu atur set dan repetisinya</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              aria-label="Kategori gerakan rutinitas"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedExerciseId('') // Reset selected exercise when category changes
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
                aria-label="Pilih gerakan rutinitas"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white capitalize text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Pilih gerakan...</option>
                {filteredExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
              <Button onClick={addExercise} className="gap-2 bg-orange-500 hover:bg-orange-600 shrink-0">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>

          {exercises.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-slate-400">
              Belum ada gerakan. Pilih satu di atas untuk mulai menyusun sesi.
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex items-end gap-2 sm:gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 font-semibold text-white">{exercise.exerciseName}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor={`routine-sets-${index}`} className="text-xs text-slate-400">Set</label>
                        <input
                          id={`routine-sets-${index}`}
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                          className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                          min="1"
                          max="10"
                        />
                      </div>
                      <div>
                        <label htmlFor={`routine-reps-${index}`} className="text-xs text-slate-400">Reps</label>
                        <input
                          id={`routine-reps-${index}`}
                          type="number"
                          value={exercise.reps || ''}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value ? parseInt(e.target.value) : '')}
                          className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label htmlFor={`routine-weight-${index}`} className="text-xs text-slate-400">Beban (kg)</label>
                        <input
                          id={`routine-weight-${index}`}
                          inputMode="decimal"
                          type="text"
                          value={exercise.weight || ''}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          className="w-full rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeExercise(index)}
                    aria-label={`Hapus gerakan ${exercise.exerciseName}`}
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300 border-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 text-lg">
          {loading ? 'Menyimpan...' : 'Simpan rutinitas'}
        </Button>
      </div>
    </div>
  )
}
