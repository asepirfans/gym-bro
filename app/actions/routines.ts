'use server'

import { getSession } from '@/lib/simple-auth'
import { db } from '@/lib/db'
import { routine, routineExercise } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Get user's routines
export async function getUserRoutines() {
  const userId = await getUserId()
  return db.select().from(routine).where(eq(routine.userId, userId))
}

// Get single routine with exercises
export async function getRoutine(id: number) {
  const userId = await getUserId()
  const routineData = await db
    .select()
    .from(routine)
    .where(and(eq(routine.id, id), eq(routine.userId, userId)))

  if (!routineData.length) throw new Error('Routine not found')
  return routineData[0]
}

// Create routine
export async function createRoutine(data: { name: string; description?: string }) {
  const userId = await getUserId()
  const result = await db
    .insert(routine)
    .values({
      ...data,
      userId,
    })
    .returning()

  revalidatePath('/routines')
  return result[0]
}

// Update routine
export async function updateRoutine(
  id: number,
  data: { name?: string; description?: string; isActive?: boolean },
) {
  const userId = await getUserId()
  const result = await db
    .update(routine)
    .set(data)
    .where(and(eq(routine.id, id), eq(routine.userId, userId)))
    .returning()

  revalidatePath('/routines')
  return result[0]
}

// Delete routine
export async function deleteRoutine(id: number) {
  const userId = await getUserId()
  await db
    .delete(routine)
    .where(and(eq(routine.id, id), eq(routine.userId, userId)))

  revalidatePath('/routines')
}

// Add exercise to routine
export async function addExerciseToRoutine(data: {
  routineId: number
  exerciseId: number
  sets: number
  reps?: number
  weight?: string
  duration?: number
  rest?: number
  orderIndex: number
}) {
  const userId = await getUserId()

  // Verify user owns the routine
  const routineData = await db
    .select()
    .from(routine)
    .where(and(eq(routine.id, data.routineId), eq(routine.userId, userId)))

  if (!routineData.length) throw new Error('Routine not found')

  const result = await db.insert(routineExercise).values(data).returning()
  revalidatePath(`/routines/${data.routineId}`)
  return result[0]
}

// Remove exercise from routine
export async function removeExerciseFromRoutine(routineId: number, routineExerciseId: number) {
  const userId = await getUserId()

  // Verify user owns the routine
  const routineData = await db
    .select()
    .from(routine)
    .where(and(eq(routine.id, routineId), eq(routine.userId, userId)))

  if (!routineData.length) throw new Error('Routine not found')

  await db.delete(routineExercise).where(eq(routineExercise.id, routineExerciseId))
  revalidatePath(`/routines/${routineId}`)
}

// Fetch exercises belonging to a routine (with default sets/reps/weights)
export async function getRoutineExercises(routineId: number) {
  const userId = await getUserId()

  // Verify ownership
  const routineData = await db
    .select()
    .from(routine)
    .where(and(eq(routine.id, routineId), eq(routine.userId, userId)))

  if (!routineData.length) throw new Error('Routine not found')

  const exerciseTable = require('@/lib/db/schema').exercise // Import here to avoid circular dependencies if any

  return db
    .select({
      id: exerciseTable.id,
      name: exerciseTable.name,
      sets: routineExercise.sets,
      reps: routineExercise.reps,
      weight: routineExercise.weight,
    })
    .from(routineExercise)
    .innerJoin(exerciseTable, eq(routineExercise.exerciseId, exerciseTable.id))
    .where(eq(routineExercise.routineId, routineId))
    .orderBy(routineExercise.orderIndex)
}
