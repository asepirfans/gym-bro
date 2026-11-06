import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groupPreviousSets, previousWorkoutSetsQuery } from '../lib/workout-history.ts'

test('previous sets preserve set order, bodyweight zero, and exercise boundaries', () => {
  assert.deepEqual(groupPreviousSets([
    { exerciseId: 1, setNumber: 1, reps: 10, weight: '0' },
    { exerciseId: 1, setNumber: 2, reps: 8, weight: '60.00' },
    { exerciseId: 2, setNumber: 1, reps: null, weight: null },
  ]), {
    1: [{ setNumber: 1, reps: 10, weight: '0' }, { setNumber: 2, reps: 8, weight: '60.00' }],
    2: [{ setNumber: 1, reps: undefined, weight: undefined }],
  })
  assert.deepEqual(groupPreviousSets([]), {})
})

test('batch query chooses the latest completed session per exercise and isolates users', { skip: !process.env.DATABASE_URL }, async () => {
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    // VALUES fixtures are read-only and shadow the real tables for this statement.
    const fixtures = `WITH workout(id, userid, completedat) AS (VALUES
      (1, 'fixture-a', '2026-11-01'::timestamp),
      (2, 'fixture-a', '2026-11-02'::timestamp),
      (3, 'fixture-b', '2026-11-03'::timestamp),
      (4, 'fixture-a', NULL::timestamp)
    ), "workoutSet"(workoutid, exerciseid, setnumber, reps, weight) AS (VALUES
      (1, 10, 1, 10, '50'), (1, 20, 1, 12, '0'),
      (2, 10, 1, 8, '60'), (2, 10, 2, 6, '60'),
      (3, 20, 1, 10, '200'), (4, 20, 1, 10, '300')
    ),`
    const query = fixtures + previousWorkoutSetsQuery.replace(/^\s*WITH\s+/, '')
    const result = await pool.query(query, ['fixture-a', [10, 20, 30]])
    assert.deepEqual(result.rows, [
      { exerciseId: 10, setNumber: 1, reps: 8, weight: '60' },
      { exerciseId: 10, setNumber: 2, reps: 6, weight: '60' },
      { exerciseId: 20, setNumber: 1, reps: 12, weight: '0' },
    ])
  } finally { await pool.end() }
})
