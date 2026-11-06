import test from 'node:test'
import assert from 'node:assert/strict'
import { validateBodyWeight, bodyWeightQueries } from '../lib/body-weight.ts'

test('body weight accepts kg decimals and valid calendar dates', () => {
  assert.deepEqual(validateBodyWeight({ recordedOn: '2024-02-29', kg: ' 72,45 ' }), { recordedOn: '2024-02-29', kg: '72.45' })
  assert.equal(validateBodyWeight({ recordedOn: '2026-11-06', kg: '1000' }).kg, '1000.00')
  for (const recordedOn of ['2026-02-29', '2026-02-30', '2026-13-01', '26-11-06', '1800-01-01', 'bad']) assert.throws(() => validateBodyWeight({ recordedOn, kg: '72' }))
  for (const kg of ['', '0', '-1', '1001', 'NaN', 'Infinity', '7e1', '72.123', '72kg', "1'; DROP TABLE user;"]) assert.throws(() => validateBodyWeight({ recordedOn: '2026-11-06', kg }))
  assert.throws(() => validateBodyWeight(null))
})

test('body-weight queries isolate users, upsert by day, sort dates, and scope deletion', { skip: !process.env.DATABASE_URL }, async () => {
  const { Client } = await import('pg')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query('BEGIN')
    // This temporary table shadows the real table; tests never insert account data.
    await client.query(`CREATE TEMP TABLE "bodyWeight" (id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, userid text NOT NULL, recordedon date NOT NULL, weight numeric(6,2) NOT NULL CHECK (weight > 0 AND weight <= 1000), UNIQUE(userid, recordedon)) ON COMMIT DROP`)
    const a = (await client.query(bodyWeightQueries.save, ['fixture-a', '2026-11-01', '72.5'])).rows[0]
    const b = (await client.query(bodyWeightQueries.save, ['fixture-b', '2026-11-01', '92'])).rows[0]
    const updated = (await client.query(bodyWeightQueries.save, ['fixture-a', '2026-11-01', '71.75'])).rows[0]
    assert.equal(a.id, updated.id)
    assert.equal(updated.kg, 71.75)
    const newer = (await client.query(bodyWeightQueries.save, ['fixture-a', '2026-11-02', '71'])).rows[0]
    assert.deepEqual((await client.query(bodyWeightQueries.list, ['fixture-a'])).rows.map(row => row.recordedOn), ['2026-11-02', '2026-11-01'])
    assert.equal((await client.query(bodyWeightQueries.list, ['fixture-b'])).rows[0].kg, 92)
    assert.equal((await client.query(bodyWeightQueries.delete, ['fixture-a', b.id])).rowCount, 0)
    assert.equal((await client.query(bodyWeightQueries.delete, ['fixture-a', newer.id])).rowCount, 1)
    assert.equal((await client.query(bodyWeightQueries.list, ['fixture-a'])).rows.length, 1)
    await assert.rejects(client.query(bodyWeightQueries.save, ['fixture-a', '2026-11-03', '0']))
  } finally {
    await client.query('ROLLBACK').catch(() => {})
    await client.end()
  }
})
