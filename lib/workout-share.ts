export interface ShareSet {
  exerciseId?: number
  exerciseName: string
  exerciseCategory: string
  reps: number | null
  weight: string | null
}

export function summarizeWorkout(sets: ShareSet[]) {
  const exercises = new Map<string | number, { name: string; sets: number; reps: number; volume: number; bestWeight: number }>()
  const muscles: Record<string, number> = {}
  let volume = 0
  let reps = 0
  for (const set of sets) {
    const count = Math.max(0, Number(set.reps) || 0)
    const parsedWeight = Number((set.weight || '0').replace(',', '.'))
    const weight = Number.isFinite(parsedWeight) ? Math.max(0, parsedWeight) : 0
    const key = set.exerciseId ?? set.exerciseName
    const exercise = exercises.get(key) ?? { name: set.exerciseName, sets: 0, reps: 0, volume: 0, bestWeight: 0 }
    exercise.sets++
    exercise.reps += count
    exercise.volume += count * weight
    exercise.bestWeight = Math.max(exercise.bestWeight, weight)
    exercises.set(key, exercise)
    const category = set.exerciseCategory.toLowerCase()
    muscles[category] = (muscles[category] || 0) + 1
    volume += count * weight
    reps += count
  }
  return { exercises: [...exercises.values()], muscles, volume, reps, sets: sets.length }
}

export function shareFilename(title: string) {
  return `gymbro-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'latihan'}.png`
}
