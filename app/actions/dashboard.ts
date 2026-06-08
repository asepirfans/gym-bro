'use server'

import { pool } from '@/lib/db'
import { getSession } from '@/lib/simple-auth'

export async function getDashboardStats() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  const userId = session.user.id

  try {
    // 1. Workouts this week
    const workoutsResult = await pool.query(
      `SELECT COUNT(*) FROM "workout" 
       WHERE "userid" = $1 AND "startedat" >= NOW() - INTERVAL '7 days'`,
      [userId]
    )
    const workoutsCount = parseInt(workoutsResult.rows[0].count) || 0

    // 2. Routines count
    const routinesResult = await pool.query(
      `SELECT COUNT(*) FROM "routine" WHERE "userid" = $1 AND "isactive" = true`,
      [userId]
    )
    const routinesCount = parseInt(routinesResult.rows[0].count) || 0

    // 3. Personal Records count
    const progressResult = await pool.query(
      `SELECT COUNT(*) FROM "progress" WHERE "userid" = $1`,
      [userId]
    )
    const progressCount = parseInt(progressResult.rows[0].count) || 0

    // 4. Recent Workouts
    const recentWorkoutsResult = await pool.query(
      `SELECT w.id, w.name as "workoutName", r.name as "routineName", w."startedat", w."completedat", w.duration, 
              (SELECT COUNT(*) FROM "workoutSet" ws WHERE ws."workoutid" = w.id) as "exerciseCount"
       FROM "workout" w
       LEFT JOIN "routine" r ON w."routineid" = r.id
       WHERE w."userid" = $1 AND w."completedat" IS NOT NULL
       ORDER BY w."startedat" DESC
       LIMIT 3`,
      [userId]
    )
    
    const recentWorkouts = recentWorkoutsResult.rows.map(w => ({
      id: w.id,
      name: w.workoutName || w.routineName || 'Quick Workout',
      date: new Date(w.startedat).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      duration: w.duration || 0,
      exercises: parseInt(w.exerciseCount) || 0
    }))

    return {
      workoutsCount,
      routinesCount,
      progressCount,
      recentWorkouts
    }
  } catch (error) {
    console.error('getDashboardStats error:', error)
    return {
      workoutsCount: 0,
      routinesCount: 0,
      progressCount: 0,
      recentWorkouts: []
    }
  }
}

export async function getProgressStats() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  const userId = session.user.id

  try {
    // 1. Personal Records
    const prsResult = await pool.query(
      `SELECT e.name as exercise, p.weight, p."recordedat" as date
       FROM "progress" p
       JOIN "exercise" e ON p."exerciseid" = e.id
       WHERE p."userid" = $1
       ORDER BY p."recordedat" DESC`,
      [userId]
    )
    const personalRecords = prsResult.rows.map(row => ({
      exercise: row.exercise,
      weight: parseFloat(row.weight) || 0,
      date: row.date.toISOString().split('T')[0]
    }))

    // 2. Weekly Volume
    const dailyVolumeResult = await pool.query(
      `SELECT TO_CHAR(w."startedat", 'Dy') as day, 
               SUM(COALESCE(ws.reps, 0) * COALESCE(ws.weight, 0))::integer as volume
       FROM "workout" w
       JOIN "workoutSet" ws ON ws."workoutid" = w.id
       WHERE w."userid" = $1 AND w."startedat" >= NOW() - INTERVAL '7 days'
       GROUP BY TO_CHAR(w."startedat", 'Dy'), DATE_TRUNC('day', w."startedat")
       ORDER BY DATE_TRUNC('day', w."startedat")`,
      [userId]
    )
    
    // Map to standard 7 days
    const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
    dailyVolumeResult.rows.forEach(row => {
      const trimmedDay = row.day.trim()
      if (trimmedDay in dayMap) {
        dayMap[trimmedDay] = row.volume
      }
    })
    const volumeData = Object.entries(dayMap).map(([date, volume]) => ({ date, volume }))

    // 3. Monthly Workouts & Volume
    const monthlyProgressResult = await pool.query(
      `SELECT TO_CHAR(w."startedat", 'Mon') as month, 
              COUNT(DISTINCT w.id) as workouts,
              SUM(COALESCE(ws.reps, 0) * COALESCE(ws.weight, 0))::integer as "totalVolume",
              AVG(COALESCE(w.duration, 0))::integer as "avgDuration"
       FROM "workout" w
       LEFT JOIN "workoutSet" ws ON ws."workoutid" = w.id
       WHERE w."userid" = $1 AND w."startedat" >= NOW() - INTERVAL '6 months'
       GROUP BY TO_CHAR(w."startedat", 'Mon'), DATE_TRUNC('month', w."startedat")
       ORDER BY DATE_TRUNC('month', w."startedat")`,
      [userId]
    )
    const monthlyProgress = monthlyProgressResult.rows.map(row => ({
      month: row.month.trim(),
      workouts: parseInt(row.workouts) || 0,
      totalVolume: row.totalVolume || 0,
      avgDuration: row.avgDuration || 0
    }))

    // 4. Muscle Group volume
    const muscleGroupResult = await pool.query(
      `SELECT e.category as muscle,
              SUM(COALESCE(ws.reps, 0) * COALESCE(ws.weight, 0))::integer as volume,
              SUM(COALESCE(ws.reps, 0))::integer as reps
       FROM "workout" w
       JOIN "workoutSet" ws ON ws."workoutid" = w.id
       JOIN "exercise" e ON ws."exerciseid" = e.id
       WHERE w."userid" = $1
       GROUP BY e.category`,
      [userId]
    )
    const muscleGroupData = muscleGroupResult.rows.map(row => ({
      muscle: row.muscle.charAt(0).toUpperCase() + row.muscle.slice(1),
      volume: row.volume || 0,
      reps: row.reps || 0
    }))

    return {
      personalRecords,
      volumeData,
      monthlyProgress,
      muscleGroupData
    }
  } catch (error) {
    console.error('getProgressStats error:', error)
    return {
      personalRecords: [],
      volumeData: [],
      monthlyProgress: [],
      muscleGroupData: []
    }
  }
}
