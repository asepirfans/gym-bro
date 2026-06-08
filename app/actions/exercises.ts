'use server'

import { getSession } from '@/lib/simple-auth'
import { db } from '@/lib/db'
import { exercise } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// Get all exercises (available to all users)
export async function getExercises() {
  return db.select().from(exercise)
}

// Get exercises by category
export async function getExercisesByCategory(category: string) {
  return db.select().from(exercise).where(eq(exercise.category, category))
}

// Get a single exercise
export async function getExercise(id: number) {
  return db.select().from(exercise).where(eq(exercise.id, id))
}

// Create new exercise (admin only - for now allowing all)
export async function createExercise(data: {
  name: string
  description?: string
  category: string
  imageUrl?: string
}) {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  const result = await db.insert(exercise).values(data).returning()
  revalidatePath('/exercises')
  return result[0]
}
