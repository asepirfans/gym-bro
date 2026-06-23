'use server'

import { getSession } from '@/lib/simple-auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq, ne, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getUserProfile() {
  const userId = await getUserId()
  const userData = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, userId))

  if (!userData.length) throw new Error('User not found')
  return userData[0]
}

export async function updateUserProfile(data: { name: string; username: string }) {
  const userId = await getUserId()

  // Clean and validate username
  const cleanUsername = data.username.trim().toLowerCase()
  const cleanName = data.name.trim()

  if (!cleanName) {
    throw new Error('Nama tidak boleh kosong')
  }

  if (cleanUsername.length < 3 || cleanUsername.length > 15) {
    throw new Error('Username harus berukuran antara 3 sampai 15 karakter')
  }

  // Regex validation: alphanumeric, dashes, underscores
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(cleanUsername)) {
    throw new Error('Username hanya boleh berisi huruf, angka, garis bawah (_), dan tanda hubung (-)')
  }

  // Check if username is already taken by another user
  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.username, cleanUsername), ne(user.id, userId)))

  if (existingUser.length > 0) {
    throw new Error('Username sudah digunakan oleh orang lain')
  }

  // Update profile
  await db
    .update(user)
    .set({
      name: cleanName,
      username: cleanUsername,
    })
    .where(eq(user.id, userId))

  revalidatePath('/profile')
  revalidatePath('/routines')
}
