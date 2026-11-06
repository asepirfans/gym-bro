import assert from 'node:assert/strict'
import { test } from 'node:test'
import { elapsedSecondsSince, remainingRestSeconds } from '../lib/workout-clock.ts'
import { calendarDays, localDateKey } from '../lib/workout-calendar.ts'

test('elapsed time includes a background gap without interval ticks', () => {
  const start = Date.parse('2026-11-05T09:00:00Z')
  assert.equal(elapsedSecondsSince(start, start + 185_000), 185)
  assert.equal(elapsedSecondsSince(new Date(start).toISOString(), start + 3_601_000), 3601)
  assert.equal(elapsedSecondsSince(start, start - 1000), 0)
  assert.equal(elapsedSecondsSince('invalid'), 0)
})

test('rest deadline catches up after backgrounding and never goes negative', () => {
  const start = 1_000_000
  const deadline = start + 90_000
  assert.equal(remainingRestSeconds(deadline, start), 90)
  assert.equal(remainingRestSeconds(deadline, start + 65_100), 25)
  assert.equal(remainingRestSeconds(deadline, start + 90_000), 0)
  assert.equal(remainingRestSeconds(deadline, start + 300_000), 0)
})

test('a paused rest resumes from its remaining time instead of its old deadline', () => {
  const remaining = remainingRestSeconds(90_000, 35_000)
  const resumedAt = 500_000
  const resumedDeadline = resumedAt + remaining * 1000
  assert.equal(remainingRestSeconds(resumedDeadline, resumedAt), 55)
  assert.equal(remainingRestSeconds(resumedDeadline + 30_000, resumedAt + 10_000), 75)
  assert.equal(remainingRestSeconds(resumedDeadline - 30_000, resumedAt + 10_000), 15)
})

test('calendar uses Monday first, includes leap day, and wraps months', () => {
  const november = calendarDays(2026, 10)
  assert.equal(november.length, 42)
  assert.deepEqual(november.slice(0, 6), Array(6).fill(null))
  assert.equal(november[6].getDate(), 1)
  assert.equal(november.filter(Boolean).length, 30)
  assert.equal(calendarDays(2024, 1).filter(Boolean).length, 29)
  assert.equal(calendarDays(2025, 1).filter(Boolean).length, 28)
  assert.equal(calendarDays(2026, 12).find(Boolean).getFullYear(), 2027)
})

test('date keys follow the local training day, including midnight boundaries', () => {
  assert.equal(localDateKey(new Date(2026, 10, 5, 0, 1)), '2026-11-05')
  assert.equal(localDateKey(new Date(2026, 10, 4, 23, 59)), '2026-11-04')
  assert.equal(localDateKey(new Date(2026, 0, 1)), '2026-01-01')
})
