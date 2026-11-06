'use server'

import { getSession } from '@/lib/simple-auth'
import { pool } from '@/lib/db'
import { bodyWeightQueries, validateBodyWeight, type BodyWeightEntry } from '@/lib/body-weight'
import { revalidatePath } from 'next/cache'

async function userId() {
  const session = await getSession()
  if (!session?.user) throw new Error('Silakan masuk ke akun.')
  return session.user.id
}

export async function getBodyWeights(): Promise<BodyWeightEntry[]> {
  const owner = await userId()
  return (await pool.query<BodyWeightEntry>(bodyWeightQueries.list, [owner])).rows
}

export async function saveBodyWeight(input: { recordedOn: string; kg: string }): Promise<BodyWeightEntry> {
  const owner = await userId()
  const entry = validateBodyWeight(input)
  const result = await pool.query<BodyWeightEntry>(bodyWeightQueries.save, [owner, entry.recordedOn, entry.kg])
  revalidatePath('/progress')
  return result.rows[0]
}

export async function deleteBodyWeight(id: number) {
  const owner = await userId()
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Catatan tidak valid.')
  const result = await pool.query(bodyWeightQueries.delete, [owner, id])
  if (!result.rowCount) throw new Error('Catatan tidak ditemukan.')
  revalidatePath('/progress')
}
