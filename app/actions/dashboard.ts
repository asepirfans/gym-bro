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
       LIMIT 5`,
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

export async function getAIWorkoutInsights() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  const userId = session.user.id

  try {
    // 1. Workout count this week vs last week
    const weeklyCountResult = await pool.query(
      `SELECT
         COUNT(CASE WHEN w."startedat" >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week,
         COUNT(CASE WHEN w."startedat" >= NOW() - INTERVAL '14 days' AND w."startedat" < NOW() - INTERVAL '7 days' THEN 1 END) as last_week
       FROM "workout" w
       WHERE w."userid" = $1 AND w."completedat" IS NOT NULL`,
      [userId]
    )

    // 2. Volume this month vs last month by muscle group
    const muscleVolumeResult = await pool.query(
      `SELECT
         e.category,
         SUM(CASE WHEN w."startedat" >= NOW() - INTERVAL '30 days' THEN COALESCE(ws.reps,0) * COALESCE(ws.weight::float,0) ELSE 0 END)::integer as vol_recent,
         SUM(CASE WHEN w."startedat" >= NOW() - INTERVAL '60 days' AND w."startedat" < NOW() - INTERVAL '30 days' THEN COALESCE(ws.reps,0) * COALESCE(ws.weight::float,0) ELSE 0 END)::integer as vol_prev,
         COUNT(DISTINCT CASE WHEN w."startedat" >= NOW() - INTERVAL '30 days' THEN w.id END) as sessions_recent,
         COUNT(DISTINCT CASE WHEN w."startedat" >= NOW() - INTERVAL '60 days' AND w."startedat" < NOW() - INTERVAL '30 days' THEN w.id END) as sessions_prev,
         MAX(CASE WHEN w."startedat" >= NOW() - INTERVAL '30 days' THEN w."startedat" END) as last_trained
       FROM "workout" w
       JOIN "workoutSet" ws ON ws."workoutid" = w.id
       JOIN "exercise" e ON ws."exerciseid" = e.id
       WHERE w."userid" = $1 AND w."completedat" IS NOT NULL AND w."startedat" >= NOW() - INTERVAL '60 days'
       GROUP BY e.category`,
      [userId]
    )

    // 3. Exercise-level progress: per exercise max weight this month vs last month
    const exerciseProgressResult = await pool.query(
      `WITH recent AS (
         SELECT ws."exerciseid", e.name, e.category,
                MAX(COALESCE(ws.weight::float, 0)) as max_w_recent,
                MAX(COALESCE(ws.reps, 0)) as max_r_recent,
                COUNT(DISTINCT w.id) as sessions
         FROM "workout" w
         JOIN "workoutSet" ws ON ws."workoutid" = w.id
         JOIN "exercise" e ON ws."exerciseid" = e.id
         WHERE w."userid" = $1 AND w."startedat" >= NOW() - INTERVAL '30 days' AND w."completedat" IS NOT NULL
         GROUP BY ws."exerciseid", e.name, e.category
       ),
       prev AS (
         SELECT ws."exerciseid",
                MAX(COALESCE(ws.weight::float, 0)) as max_w_prev,
                MAX(COALESCE(ws.reps, 0)) as max_r_prev
         FROM "workout" w
         JOIN "workoutSet" ws ON ws."workoutid" = w.id
         WHERE w."userid" = $1 AND w."startedat" >= NOW() - INTERVAL '60 days'
           AND w."startedat" < NOW() - INTERVAL '30 days' AND w."completedat" IS NOT NULL
         GROUP BY ws."exerciseid"
       )
       SELECT r.name, r.category, r.max_w_recent, r.max_r_recent, r.sessions,
              p.max_w_prev, p.max_r_prev
       FROM recent r
       LEFT JOIN prev p ON r."exerciseid" = p."exerciseid"
       ORDER BY r.sessions DESC`,
      [userId]
    )

    // 4. Most recent personal records (last 14 days)
    const recentPRsResult = await pool.query(
      `SELECT e.name, p."maxweight", p."recordedat"
       FROM "progress" p
       JOIN "exercise" e ON p."exerciseid" = e.id
       WHERE p."userid" = $1 AND p."recordedat" >= NOW() - INTERVAL '14 days'
       ORDER BY p."recordedat" DESC
       LIMIT 5`,
      [userId]
    )

    // 5. Total volume this vs last month
    const totalVolumeResult = await pool.query(
      `SELECT
         SUM(CASE WHEN w."startedat" >= NOW() - INTERVAL '30 days' THEN COALESCE(ws.reps,0) * COALESCE(ws.weight::float,0) ELSE 0 END)::integer as vol_this,
         SUM(CASE WHEN w."startedat" >= NOW() - INTERVAL '60 days' AND w."startedat" < NOW() - INTERVAL '30 days' THEN COALESCE(ws.reps,0) * COALESCE(ws.weight::float,0) ELSE 0 END)::integer as vol_last
       FROM "workout" w
       JOIN "workoutSet" ws ON ws."workoutid" = w.id
       WHERE w."userid" = $1 AND w."completedat" IS NOT NULL AND w."startedat" >= NOW() - INTERVAL '60 days'`,
      [userId]
    )

    // ---- Process Data ----
    const thisWeek = parseInt(weeklyCountResult.rows[0]?.this_week) || 0
    const lastWeek = parseInt(weeklyCountResult.rows[0]?.last_week) || 0
    const volThis = totalVolumeResult.rows[0]?.vol_this || 0
    const volLast = totalVolumeResult.rows[0]?.vol_last || 0

    const muscleRows = muscleVolumeResult.rows
    const exRows = exerciseProgressResult.rows
    const prRows = recentPRsResult.rows

    // No data at all?
    if (thisWeek === 0 && lastWeek === 0 && muscleRows.length === 0) {
      return {
        hasData: false,
        insightsList: [],
        metrics: {
          exerciseProgress: [],
          volumeProgress: { lastMonth: '0 kg', thisMonth: '0 kg', progress: '+0%' },
          workoutFrequency: []
        }
      }
    }

    const insightsList: { type: 'success' | 'warning' | 'info'; text: string }[] = []

    // --- Dynamic Rule 1: Workout frequency trend (this week vs last week) ---
    if (lastWeek > 0) {
      const freqDiff = thisWeek - lastWeek
      if (freqDiff > 0) {
        insightsList.push({ type: 'success', text: `Frekuensi latihan naik ${freqDiff} sesi dibanding minggu lalu (${lastWeek} → ${thisWeek} sesi). Konsistensi terjaga! 🔥` })
      } else if (freqDiff < 0) {
        insightsList.push({ type: 'warning', text: `Frekuensi latihan turun ${Math.abs(freqDiff)} sesi dibanding minggu lalu (${lastWeek} → ${thisWeek} sesi). Jaga konsistensinya!` })
      } else {
        insightsList.push({ type: 'info', text: `Frekuensi latihan sama seperti minggu lalu (${thisWeek} sesi). Konsisten!` })
      }
    } else if (thisWeek > 0) {
      insightsList.push({ type: 'info', text: `${thisWeek} sesi latihan diselesaikan minggu ini. Data akan semakin lengkap pekan depan.` })
    }

    // --- Dynamic Rule 2: Total volume trend ---
    if (volLast > 0) {
      const pct = Math.round(((volThis - volLast) / volLast) * 100)
      if (pct >= 10) {
        insightsList.push({ type: 'success', text: `Total volume bulan ini naik ${pct}% dibanding bulan lalu. Progressive overload berjalan baik! 💪` })
      } else if (pct <= -10) {
        insightsList.push({ type: 'warning', text: `Total volume bulan ini turun ${Math.abs(pct)}% dibanding bulan lalu. Pertimbangkan menambah beban atau sesi.` })
      }
    }

    // --- Dynamic Rule 3: Muscle group imbalance (relative to user's own distribution) ---
    if (muscleRows.length >= 2) {
      const totalVol = muscleRows.reduce((s: number, r: any) => s + (parseInt(r.vol_recent) || 0), 0)
      if (totalVol > 0) {
        const avgShare = 100 / muscleRows.length
        // Find most over-trained and most under-trained relative to user's own average
        const sorted = [...muscleRows].sort((a: any, b: any) => (parseInt(b.vol_recent) || 0) - (parseInt(a.vol_recent) || 0))
        const top = sorted[0]
        const bottom = sorted[sorted.length - 1]
        const topPct = Math.round(((parseInt(top.vol_recent) || 0) / totalVol) * 100)
        const bottomPct = Math.round(((parseInt(bottom.vol_recent) || 0) / totalVol) * 100)

        if (topPct > avgShare * 2.5 && bottom.category !== top.category) {
          const topName = top.category.charAt(0).toUpperCase() + top.category.slice(1)
          const bottomName = bottom.category.charAt(0).toUpperCase() + bottom.category.slice(1)
          insightsList.push({ type: 'warning', text: `Latihan ${topName} mendominasi ${topPct}% dari total volume, sementara ${bottomName} hanya ${bottomPct}%. Pertimbangkan pemerataan program.` })
        }
      }
    }

    // --- Dynamic Rule 4: Neglected muscle groups (no training in last 14 days) ---
    if (muscleRows.length > 0) {
      const now = Date.now()
      const neglected = muscleRows.filter((r: any) => {
        if (!r.last_trained) return false
        const daysSince = (now - new Date(r.last_trained).getTime()) / (1000 * 60 * 60 * 24)
        return daysSince > 14
      })
      neglected.forEach((r: any) => {
        const name = r.category.charAt(0).toUpperCase() + r.category.slice(1)
        const daysSince = Math.floor((now - new Date(r.last_trained).getTime()) / (1000 * 60 * 60 * 24))
        insightsList.push({ type: 'warning', text: `${name} belum dilatih selama ${daysSince} hari. Coba tambahkan ke sesi berikutnya.` })
      })
    }

    // --- Dynamic Rule 5: Exercises with significant weight increase ---
    const improvedExercises = exRows.filter((r: any) => {
      const recent = parseFloat(r.max_w_recent) || 0
      const prev = parseFloat(r.max_w_prev) || 0
      return prev > 0 && recent > prev
    }).sort((a: any, b: any) => {
      const pctA = ((parseFloat(a.max_w_recent) - parseFloat(a.max_w_prev)) / parseFloat(a.max_w_prev))
      const pctB = ((parseFloat(b.max_w_recent) - parseFloat(b.max_w_prev)) / parseFloat(b.max_w_prev))
      return pctB - pctA
    })

    if (improvedExercises.length > 0) {
      const top = improvedExercises[0]
      const pct = Math.round(((parseFloat(top.max_w_recent) - parseFloat(top.max_w_prev)) / parseFloat(top.max_w_prev)) * 100)
      insightsList.push({ type: 'success', text: `Beban ${top.name} naik ${pct}% bulan ini (${parseFloat(top.max_w_prev)}kg → ${parseFloat(top.max_w_recent)}kg). Kerja bagus!` })
    }

    // --- Dynamic Rule 6: Stagnant exercises (no improvement, trained in both periods) ---
    const stagnantExercises = exRows.filter((r: any) => {
      const recent = parseFloat(r.max_w_recent) || 0
      const prev = parseFloat(r.max_w_prev) || 0
      return prev > 0 && recent <= prev && parseInt(r.sessions) >= 3
    })
    if (stagnantExercises.length > 0) {
      const names = stagnantExercises.slice(0, 2).map((r: any) => r.name).join(' & ')
      insightsList.push({ type: 'warning', text: `${names} tidak mengalami peningkatan beban dalam 30 hari terakhir. Coba variasi rep range atau teknik overloading.` })
    }

    // --- Dynamic Rule 7: Recent PRs ---
    if (prRows.length > 0) {
      const prNames = prRows.slice(0, 2).map((r: any) => r.name).join(' & ')
      insightsList.push({ type: 'success', text: `Personal Record baru: ${prNames}! Performa terbaikmu selama ini. 🏆` })
    }

    // Fallback
    if (insightsList.length === 0) {
      insightsList.push({ type: 'info', text: 'Mulai catat lebih banyak latihan untuk mendapatkan insight personal yang akurat.' })
    }

    // ---- Format Output Metrics ----
    const exerciseProgress = exRows.slice(0, 4).map((ep: any) => {
      const recent = parseFloat(ep.max_w_recent) || 0
      const prev = parseFloat(ep.max_w_prev) || 0
      const progressPct = prev > 0 ? Math.round(((recent - prev) / prev) * 100) : 0
      return {
        name: ep.name,
        lastMonth: prev > 0 ? `${prev}kg × ${ep.max_r_prev}` : '—',
        thisMonth: `${recent}kg × ${ep.max_r_recent}`,
        progress: prev > 0 ? (progressPct >= 0 ? `+${progressPct}%` : `${progressPct}%`) : 'New'
      }
    })

    const volPct = volLast > 0 ? Math.round(((volThis - volLast) / volLast) * 100) : 0
    const volumeProgress = {
      lastMonth: volLast >= 1000 ? `${(volLast / 1000).toFixed(1)}k kg` : `${volLast} kg`,
      thisMonth: volThis >= 1000 ? `${(volThis / 1000).toFixed(1)}k kg` : `${volThis} kg`,
      progress: volPct >= 0 ? `+${volPct}%` : `${volPct}%`
    }

    const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']
    const freqMap: Record<string, number> = {}
    muscleRows.forEach((r: any) => { freqMap[r.category] = parseInt(r.sessions_recent) || 0 })
    const workoutFrequency = categories.map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: freqMap[cat] || 0
    }))

    return {
      hasData: true,
      insightsList,
      metrics: { exerciseProgress, volumeProgress, workoutFrequency }
    }

  } catch (e) {
    console.error('getAIWorkoutInsights error:', e)
    return {
      hasData: false,
      insightsList: [],
      metrics: {
        exerciseProgress: [],
        volumeProgress: { lastMonth: '0 kg', thisMonth: '0 kg', progress: '+0%' },
        workoutFrequency: []
      }
    }
  }
}

