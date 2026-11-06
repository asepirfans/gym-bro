export const previousWorkoutSetsQuery = `
  WITH latest AS (
    SELECT DISTINCT ON (ws.exerciseid) ws.exerciseid, w.id AS workoutid
    FROM workout w
    JOIN "workoutSet" ws ON ws.workoutid = w.id
    WHERE w.userid = $1 AND w.completedat > to_timestamp(0)
      AND ws.exerciseid = ANY($2::int[])
    ORDER BY ws.exerciseid, w.completedat DESC, w.id DESC
  )
  SELECT ws.exerciseid AS "exerciseId", ws.setnumber AS "setNumber", ws.reps, ws.weight
  FROM latest
  JOIN "workoutSet" ws ON ws.workoutid = latest.workoutid AND ws.exerciseid = latest.exerciseid
  ORDER BY ws.exerciseid, ws.setnumber
`

interface PreviousSetRow {
  exerciseId: number
  setNumber: number
  reps: number | null
  weight: string | null
}

export function groupPreviousSets(rows: PreviousSetRow[]) {
  const grouped: Record<number, { setNumber: number; reps?: number; weight?: string }[]> = {}
  for (const row of rows) {
    const sets = grouped[row.exerciseId] ?? (grouped[row.exerciseId] = [])
    sets.push({ setNumber: row.setNumber, reps: row.reps || undefined, weight: row.weight || undefined })
  }
  return grouped
}
