import { pool } from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, name, description, category, "imageUrl", "createdAt" FROM "exercise" ORDER BY category, name',
    )
    return Response.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return Response.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
