export interface BodyWeightEntry { id: number; recordedOn: string; kg: number }

export function validateBodyWeight(input: { recordedOn: string; kg: string }) {
  if (typeof input?.recordedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.recordedOn)) throw new Error('Tanggal tidak valid.')
  const date = new Date(`${input.recordedOn}T12:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input.recordedOn || input.recordedOn < '1900-01-01' || input.recordedOn > '2100-12-31') throw new Error('Tanggal tidak valid.')
  if (typeof input.kg !== 'string' || !/^\d{1,4}(?:[.,]\d{1,2})?$/.test(input.kg.trim())) throw new Error('Masukkan berat dalam kg, maksimal 2 angka desimal.')
  const kg = Number(input.kg.trim().replace(',', '.'))
  if (kg <= 0 || kg > 1000) throw new Error('Berat harus lebih dari 0 dan maksimal 1.000 kg.')
  return { recordedOn: input.recordedOn, kg: kg.toFixed(2) }
}

export const bodyWeightQueries = {
  list: 'SELECT id, recordedon::text AS "recordedOn", weight::float8 AS kg FROM "bodyWeight" WHERE userid = $1 ORDER BY recordedon DESC, id DESC',
  save: `INSERT INTO "bodyWeight" (userid, recordedon, weight) VALUES ($1, $2::date, $3::numeric)
    ON CONFLICT (userid, recordedon) DO UPDATE SET weight = EXCLUDED.weight
    RETURNING id, recordedon::text AS "recordedOn", weight::float8 AS kg`,
  delete: 'DELETE FROM "bodyWeight" WHERE userid = $1 AND id = $2 RETURNING id',
}
