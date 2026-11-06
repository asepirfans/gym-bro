'use server'

import { getExercises } from './exercises'
import { getRoutineExercises } from './routines'
import { getPreviousWorkoutSetsBatch } from './workouts'

export async function getWorkoutTemplate(routineId?: number) {
  if (routineId !== undefined && (!Number.isSafeInteger(routineId) || routineId <= 0)) throw new Error('Routine ID tidak valid')
  const [exercises, routineExercises] = await Promise.all([
    getExercises(),
    routineId ? getRoutineExercises(routineId) : Promise.resolve([]),
  ])
  let previousSets: Awaited<ReturnType<typeof getPreviousWorkoutSetsBatch>> = {}
  if (routineExercises.length) {
    try {
      previousSets = await getPreviousWorkoutSetsBatch(routineExercises.map(exercise => exercise.id))
    } catch (error) {
      console.error('Failed to load previous sets for workout:', error)
    }
  }
  return { exercises, routineExercises, previousSets }
}
