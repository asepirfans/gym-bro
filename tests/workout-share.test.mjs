import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeWorkout, shareFilename } from '../lib/workout-share.ts'

test('share totals include bodyweight sets and group exercises by ID', () => {
  const summary = summarizeWorkout([
    { exerciseId: 1, exerciseName: 'Press', exerciseCategory: 'chest', reps: 10, weight: '12,5' },
    { exerciseId: 1, exerciseName: 'Press', exerciseCategory: 'chest', reps: 8, weight: '15' },
    { exerciseId: 2, exerciseName: 'Press', exerciseCategory: 'shoulders', reps: 12, weight: null },
    { exerciseId: 3, exerciseName: 'Run', exerciseCategory: 'cardio', reps: null, weight: null },
  ])
  assert.equal(summary.volume, 245)
  assert.equal(summary.reps, 30)
  assert.equal(summary.sets, 4)
  assert.equal(summary.exercises.length, 3)
  assert.deepEqual(summary.muscles, { chest: 2, shoulders: 1, cardio: 1 })
  assert.deepEqual(summary.exercises[0], { name: 'Press', sets: 2, reps: 18, volume: 245, bestWeight: 15 })
})

test('share empty state and invalid weights stay finite; filenames are safe', () => {
  assert.equal(summarizeWorkout([]).volume, 0)
  const summary = summarizeWorkout([{ exerciseName: 'Squat', exerciseCategory: 'legs', reps: 10, weight: 'invalid' }, { exerciseName: 'Squat', exerciseCategory: 'legs', reps: 5, weight: '-10' }])
  assert.equal(summary.volume, 0)
  assert.equal(summary.exercises.length, 1)
  assert.equal(shareFilename('../Upper / body?'), 'gymbro-upper-body.png')
  assert.equal(shareFilename(''), 'gymbro-latihan.png')
})
