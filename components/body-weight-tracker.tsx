'use client'

import { useEffect, useId, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getBodyWeights, saveBodyWeight, deleteBodyWeight } from '@/app/actions/body-weight'
import { validateBodyWeight, type BodyWeightEntry } from '@/lib/body-weight'
import { localDateKey } from '@/lib/workout-calendar'
import { useToast } from '@/components/toast-provider'

const formatDate = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const formatKg = (kg: number) => kg.toLocaleString('id-ID', { maximumFractionDigits: 2 })

export default function BodyWeightTracker() {
  const id = useId()
  const [entries, setEntries] = useState<BodyWeightEntry[]>([])
  const [date, setDate] = useState('')
  const [kg, setKg] = useState('')
  const [today, setToday] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [showAll, setShowAll] = useState(false)
  const { confirm } = useToast()

  useEffect(() => {
    let cancelled = false
    const now = localDateKey(new Date())
    setToday(now)
    setDate(now)
    setLoading(true)
    setLoadFailed(false)
    getBodyWeights().then(data => {
      if (cancelled) return
      setEntries(data)
      setKg(data.find(entry => entry.recordedOn === now)?.kg.toString() || '')
    }).catch(() => { if (!cancelled) setLoadFailed(true) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [retry])

  const existing = entries.some(entry => entry.recordedOn === date)
  const chart = entries.slice(0, 30).reverse()
  const latest = entries[0]
  const first = entries[entries.length - 1]
  const difference = latest && first ? Number((latest.kg - first.kg).toFixed(2)) : 0

  function selectDate(day: string) {
    setDate(day)
    setKg(entries.find(entry => entry.recordedOn === day)?.kg.toString() || '')
    setMessage('')
    setFormError('')
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setFormError('')
    setMessage('')
    try { validateBodyWeight({ recordedOn: date, kg }) } catch (error) { setFormError(error instanceof Error ? error.message : 'Data tidak valid.'); return }
    setBusy(true)
    try {
      const saved = await saveBodyWeight({ recordedOn: date, kg })
      setEntries(previous => [...previous.filter(entry => entry.recordedOn !== saved.recordedOn), saved].sort((a, b) => b.recordedOn.localeCompare(a.recordedOn)))
      setKg(saved.kg.toString())
      setMessage('Tersimpan.')
    } catch { setFormError('Belum tersimpan. Coba lagi.') }
    finally { setBusy(false) }
  }

  function remove(entry: BodyWeightEntry) {
    confirm({ title: 'Hapus catatan?', message: `${formatDate(entry.recordedOn)} · ${formatKg(entry.kg)} kg`, danger: true, onConfirm: async () => {
      setBusy(true)
      setFormError('')
      setMessage('')
      try {
        await deleteBodyWeight(entry.id)
        setEntries(previous => previous.filter(item => item.id !== entry.id))
        if (date === entry.recordedOn) setKg('')
        setMessage('Catatan dihapus.')
      } catch { setFormError('Gagal menghapus. Coba lagi.') }
      finally { setBusy(false) }
    } })
  }

  if (loading) return <p className="py-10 text-sm text-muted-foreground" role="status">Memuat berat badan...</p>
  if (loadFailed) return <div className="space-y-3 py-8" role="alert"><p>Berat badan belum bisa dimuat.</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Coba lagi</Button></div>

  return <div className="body-weight-tracker">
    <Card>
      <CardHeader><CardTitle>Catat berat badan</CardTitle></CardHeader>
      <CardContent>
        <form className="body-weight-form" onSubmit={save}>
          <div><label htmlFor={`${id}-date`}>Tanggal</label><input id={`${id}-date`} type="date" value={date} min="1900-01-01" max={today} required disabled={busy} onChange={event => selectDate(event.target.value)} /></div>
          <div><label htmlFor={`${id}-kg`}>Berat (kg)</label><input id={`${id}-kg`} type="text" inputMode="decimal" value={kg} placeholder="72,5" required disabled={busy} maxLength={7} aria-invalid={!!formError} aria-describedby={formError ? `${id}-error` : undefined} onChange={event => { setKg(event.target.value); setMessage(''); setFormError('') }} /></div>
          <Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600">{busy ? 'Menyimpan...' : existing ? 'Perbarui' : 'Simpan'}</Button>
        </form>
        {formError && <p id={`${id}-error`} role="alert" className="mt-3 text-sm text-red-400">{formError}</p>}
        <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>

    {latest ? <Card>
      <CardHeader><CardTitle>Perubahan berat</CardTitle></CardHeader>
      <CardContent>
        <div className="body-weight-summary"><div><strong>{formatKg(latest.kg)} <small>kg</small></strong><span>{formatDate(latest.recordedOn)}</span></div>{entries.length > 1 && <div><strong>{difference > 0 ? '+' : ''}{formatKg(difference)} <small>kg</small></strong><span>Sejak {formatDate(first.recordedOn)}</span></div>}</div>
        <div role="img" aria-label="Grafik 30 catatan berat badan terakhir" className="body-weight-chart">
          <ResponsiveContainer width="100%" height={240}><LineChart data={chart} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="recordedOn" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} tickFormatter={day => new Date(`${day}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} minTickGap={24} />
            <YAxis width={40} stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} domain={[Math.floor(Math.min(...chart.map(entry => entry.kg))) - 1, Math.ceil(Math.max(...chart.map(entry => entry.kg))) + 1]} />
            <Tooltip labelFormatter={day => formatDate(String(day))} formatter={value => [`${formatKg(Number(value))} kg`, 'Berat']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--foreground)' }} />
            <Line type="monotone" dataKey="kg" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
          </LineChart></ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">30 catatan terakhir</p>
      </CardContent>
    </Card> : null}

    <Card><CardHeader><CardTitle>Riwayat berat badan</CardTitle></CardHeader><CardContent>
      {!entries.length ? <p className="text-sm text-muted-foreground">Belum ada catatan.</p> : <>
        <ul id={`${id}-history`} className="body-weight-history">{(showAll ? entries : entries.slice(0, 5)).map(entry => <li key={entry.id}><div><strong>{formatKg(entry.kg)} kg</strong><span>{formatDate(entry.recordedOn)}</span></div><div className="flex gap-2"><Button type="button" size="icon" variant="ghost" disabled={busy} aria-label={`Ubah berat ${formatDate(entry.recordedOn)}`} onClick={() => { selectDate(entry.recordedOn); document.getElementById(`${id}-kg`)?.focus() }}><Pencil size={16} aria-hidden="true" /></Button><Button type="button" size="icon" variant="ghost" disabled={busy} aria-label={`Hapus berat ${formatDate(entry.recordedOn)}`} onClick={() => remove(entry)}><Trash2 size={16} aria-hidden="true" /></Button></div></li>)}</ul>
        {entries.length > 5 && <Button type="button" variant="outline" className="mt-4" aria-controls={`${id}-history`} aria-expanded={showAll} onClick={() => setShowAll(value => !value)}>{showAll ? 'Tampilkan lebih sedikit' : `Tampilkan lainnya (${entries.length - 5})`}</Button>}
      </>}
    </CardContent></Card>
  </div>
}
