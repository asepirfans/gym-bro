'use server'

import { getSession } from '@/lib/simple-auth'
import { db } from '@/lib/db'
import { routine, routineExercise, user } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'
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

// Get system template routines
export async function getTemplateRoutines() {
  return db.select().from(routine).where(eq(routine.userId, 'system'))
}

// Get single routine with exercises
export async function getRoutine(id: number) {
  const userId = await getUserId()
  const routineData = await db
    .select()
    .from(routine)
    .where(
      and(
        eq(routine.id, id),
        or(
          eq(routine.userId, userId),
          eq(routine.userId, 'system'),
          eq(routine.isPublic, true),
        ),
      ),
    )

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

  // Verify ownership, template or public status
  const routineData = await db
    .select()
    .from(routine)
    .where(
      and(
        eq(routine.id, routineId),
        or(
          eq(routine.userId, userId),
          eq(routine.userId, 'system'),
          eq(routine.isPublic, true),
        ),
      ),
    )

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

// Share a routine directly to another user by username
export async function shareRoutineToUser(routineId: number, receiverUsername: string) {
  const senderId = await getUserId()
  const cleanUsername = receiverUsername.trim().toLowerCase()

  if (!cleanUsername) {
    throw new Error('Username tidak boleh kosong')
  }

  // 1. Find receiver by username
  const receiverResult = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, cleanUsername))

  if (!receiverResult.length) {
    throw new Error(`Username "@${cleanUsername}" tidak ditemukan`)
  }

  const receiverId = receiverResult[0].id

  if (senderId === receiverId) {
    throw new Error('Anda tidak dapat membagikan rutinitas kepada diri sendiri')
  }

  const routineShareTable = require('@/lib/db/schema').routineShare

  // 2. Check if already shared and pending
  const existingShare = await db
    .select()
    .from(routineShareTable)
    .where(
      and(
        eq(routineShareTable.routineId, routineId),
        eq(routineShareTable.senderId, senderId),
        eq(routineShareTable.receiverId, receiverId),
        eq(routineShareTable.status, 'pending')
      )
    )

  if (existingShare.length > 0) {
    throw new Error('Rutinitas sudah dibagikan ke pengguna ini dan sedang menunggu persetujuan')
  }

  // 3. Insert routine share record
  await db.insert(routineShareTable).values({
    routineId,
    senderId,
    receiverId,
    status: 'pending',
  })

  return { success: true }
}

// Get pending shared routines for logged-in user
export async function getPendingSharedRoutines() {
  const userId = await getUserId()
  const routineShareTable = require('@/lib/db/schema').routineShare

  const pendingShares = await db
    .select({
      id: routineShareTable.id,
      routineId: routineShareTable.routineId,
      status: routineShareTable.status,
      createdAt: routineShareTable.createdAt,
      routineName: routine.name,
      routineDescription: routine.description,
      senderName: user.name,
      senderUsername: user.username,
    })
    .from(routineShareTable)
    .innerJoin(routine, eq(routineShareTable.routineId, routine.id))
    .innerJoin(user, eq(routineShareTable.senderId, user.id))
    .where(
      and(
        eq(routineShareTable.receiverId, userId),
        eq(routineShareTable.status, 'pending')
      )
    )

  return pendingShares
}

// Accept or decline a shared routine
export async function respondToSharedRoutine(shareId: number, action: 'accept' | 'decline') {
  const userId = await getUserId()
  const routineShareTable = require('@/lib/db/schema').routineShare

  // 1. Verify share record exists and belongs to current user
  const shareResult = await db
    .select()
    .from(routineShareTable)
    .where(
      and(
        eq(routineShareTable.id, shareId),
        eq(routineShareTable.receiverId, userId)
      )
    )

  if (!shareResult.length) {
    throw new Error('Data berbagi rutinitas tidak ditemukan')
  }

  const shareRecord = shareResult[0]

  if (action === 'accept') {
    // 2. Fetch source routine
    const sourceRoutineData = await db
      .select()
      .from(routine)
      .where(eq(routine.id, shareRecord.routineId))

    if (!sourceRoutineData.length) {
      throw new Error('Rutinitas asal tidak ditemukan')
    }

    const sourceRoutine = sourceRoutineData[0]

    // 3. Fetch source exercises
    const sourceExercises = await db
      .select()
      .from(routineExercise)
      .where(eq(routineExercise.routineId, shareRecord.routineId))
      .orderBy(routineExercise.orderIndex)

    // 4. Create new routine for receiver
    const newRoutineInsert = await db
      .insert(routine)
      .values({
        userId,
        name: sourceRoutine.name,
        description: sourceRoutine.description,
        isPublic: false,
        isActive: true,
      })
      .returning()

    const newRoutine = newRoutineInsert[0]

    // 5. Copy exercises to new routine
    for (const se of sourceExercises) {
      await db.insert(routineExercise).values({
        routineId: newRoutine.id,
        exerciseId: se.exerciseId,
        sets: se.sets,
        reps: se.reps,
        weight: se.weight,
        duration: se.duration,
        rest: se.rest,
        orderIndex: se.orderIndex,
      })
    }
  }

  // 6. Update share record status to accepted/declined
  await db
    .update(routineShareTable)
    .set({ status: action === 'accept' ? 'accepted' : 'declined' })
    .where(eq(routineShareTable.id, shareId))

  revalidatePath('/routines')
  return { success: true }
}
