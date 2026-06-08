'use server'

import { getSession } from '@/lib/simple-auth'
import { db } from '@/lib/db'
import { workout, workoutSet, progress, exercise } from '@/lib/db/schema'
import { eq, and, desc, gt } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Get user's workouts
export async function getUserWorkouts(limit?: number) {
  const userId = await getUserId()
  const routineTable = require('@/lib/db/schema').routine

  let query = db
    .select({
      id: workout.id,
      userId: workout.userId,
      routineId: workout.routineId,
      name: workout.name,
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
      duration: workout.duration,
      notes: workout.notes,
      createdAt: workout.createdAt,
      routineName: routineTable.name,
    })
    .from(workout)
    .leftJoin(routineTable, eq(workout.routineId, routineTable.id))
    .where(eq(workout.userId, userId))
    .orderBy(desc(workout.createdAt))

  if (limit) {
    query = query.limit(limit) as any
  }

  return query
}

// Get workout details
export async function getWorkout(id: number) {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  const userId = session.user.id
  const routineTable = require('@/lib/db/schema').routine

  const workoutData = await db
    .select({
      id: workout.id,
      userId: workout.userId,
      routineId: workout.routineId,
      name: workout.name,
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
      duration: workout.duration,
      notes: workout.notes,
      createdAt: workout.createdAt,
      routineName: routineTable.name,
    })
    .from(workout)
    .leftJoin(routineTable, eq(workout.routineId, routineTable.id))
    .where(and(eq(workout.id, id), eq(workout.userId, userId)))

  if (!workoutData.length) throw new Error('Workout not found')

  const sets = await db
    .select({
      id: workoutSet.id,
      workoutId: workoutSet.workoutId,
      exerciseId: workoutSet.exerciseId,
      setNumber: workoutSet.setNumber,
      reps: workoutSet.reps,
      weight: workoutSet.weight,
      duration: workoutSet.duration,
      notes: workoutSet.notes,
      exerciseName: exercise.name,
      exerciseCategory: exercise.category,
    })
    .from(workoutSet)
    .innerJoin(exercise, eq(workoutSet.exerciseId, exercise.id))
    .where(eq(workoutSet.workoutId, id))
    .orderBy(workoutSet.setNumber)

  return {
    ...workoutData[0],
    sets,
    userName: session.user.name,
    userEmail: session.user.email,
  }
}

// Start workout
export async function startWorkout(routineId?: number) {
  const userId = await getUserId()
  const routineTable = require('@/lib/db/schema').routine
  let name = 'Quick Workout'

  if (routineId) {
    const routineData = await db
      .select()
      .from(routineTable)
      .where(eq(routineTable.id, routineId))
    if (routineData.length > 0) {
      name = routineData[0].name
    }
  }

  const result = await db
    .insert(workout)
    .values({
      userId,
      routineId,
      name,
      startedAt: new Date(),
    })
    .returning()

  revalidatePath('/workouts')
  return result[0]
}

// End workout
export async function endWorkout(id: number, duration: number, notes?: string) {
  const userId = await getUserId()
  const result = await db
    .update(workout)
    .set({
      completedAt: new Date(),
      duration,
      notes,
    })
    .where(and(eq(workout.id, id), eq(workout.userId, userId)))
    .returning()

  revalidatePath('/workouts')
  return result[0]
}

// Log workout set
export async function logWorkoutSet(data: {
  workoutId: number
  exerciseId: number
  setNumber: number
  reps?: number
  weight?: string
  duration?: number
  notes?: string
}) {
  const userId = await getUserId()

  // Verify user owns the workout
  const workoutData = await db
    .select()
    .from(workout)
    .where(and(eq(workout.id, data.workoutId), eq(workout.userId, userId)))

  if (!workoutData.length) throw new Error('Workout not found')

  const result = await db.insert(workoutSet).values(data).returning()

  // Update progress for this exercise
  if (data.weight || data.reps) {
    const existingProgress = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.exerciseId, data.exerciseId),
        ),
      )

    const weight = data.weight ? parseFloat(data.weight) : undefined
    const reps = data.reps || 0

    if (existingProgress.length) {
      const maxWeight = weight
        ? Math.max(parseFloat(existingProgress[0].maxWeight || '0') || 0, weight)
        : existingProgress[0].maxWeight

      await db
        .update(progress)
        .set({
          weight: weight ? weight.toString() : existingProgress[0].weight,
          reps: reps || existingProgress[0].reps,
          maxWeight,
          recordedAt: new Date(),
        })
        .where(
          and(
            eq(progress.userId, userId),
            eq(progress.exerciseId, data.exerciseId),
          ),
        )
    } else {
      await db.insert(progress).values({
        userId,
        exerciseId: data.exerciseId,
        weight,
        reps,
        maxWeight: weight,
        recordedAt: new Date(),
      })
    }
  }

  revalidatePath(`/workouts/${data.workoutId}`)
  return result[0]
}

// Delete workout
export async function deleteWorkout(id: number) {
  const userId = await getUserId()
  await db
    .delete(workout)
    .where(and(eq(workout.id, id), eq(workout.userId, userId)))

  revalidatePath('/workouts')
}

// Save completed workout with all sets
export async function saveWorkout(data: {
  routineId?: number
  duration: number
  notes?: string
  completedExercises: {
    exerciseId: number
    sets: {
      setNumber: number
      reps?: number
      weight?: string
    }[]
  }[]
}) {
  const userId = await getUserId()
  const routineTable = require('@/lib/db/schema').routine
  let name = 'Quick Workout'

  if (data.routineId) {
    const routineData = await db
      .select()
      .from(routineTable)
      .where(eq(routineTable.id, data.routineId))
    if (routineData.length > 0) {
      name = routineData[0].name
    }
  }

  // 1. Create workout
  const newWorkoutResult = await db
    .insert(workout)
    .values({
      userId,
      routineId: data.routineId,
      name,
      startedAt: new Date(Date.now() - data.duration * 60000),
      completedAt: new Date(),
      duration: data.duration,
      notes: data.notes,
    })
    .returning()

  const workoutId = newWorkoutResult[0].id

  // 2. Insert all sets
  for (const ex of data.completedExercises) {
    for (const s of ex.sets) {
      await logWorkoutSet({
        workoutId,
        exerciseId: ex.exerciseId,
        setNumber: s.setNumber,
        reps: s.reps,
        weight: s.weight,
      })
    }
  }

  revalidatePath('/workouts')
  revalidatePath('/progress')
  return newWorkoutResult[0]
}

// Update workout name
export async function updateWorkoutName(id: number, name: string) {
  const userId = await getUserId()
  const result = await db
    .update(workout)
    .set({ name })
    .where(and(eq(workout.id, id), eq(workout.userId, userId)))
    .returning()

  revalidatePath('/workouts')
  revalidatePath('/')
  return result[0]
}
