'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { AnatomyFrame } from '@/components/workout-anatomy-3d'
import { X, Download, Share2, Copy, Check, Loader2, RotateCcw } from 'lucide-react'
import { getWorkout } from '@/app/actions/workouts'
import { summarizeWorkout, shareFilename } from '@/lib/workout-share'
import { WorkoutShareCard, SHARE_PALETTES, SHARE_FORMATS, type SharePalette, type ShareFormat, type ShareLayout } from '@/components/workout-share-card'
import { Button } from '@/components/ui/button'

interface Props { workoutId: number | null; isOpen: boolean; onClose: () => void }
type Workout = Awaited<ReturnType<typeof getWorkout>>
const layouts: { key: ShareLayout; name: string }[] = [{ key: 'list', name: 'Daftar' }, { key: 'radar', name: 'Balance' }, { key: 'heatmap', name: 'Heatmap' }, { key: 'combined', name: 'Gabungan' }]
const WorkoutAnatomy3D = dynamic(() => import('@/components/workout-anatomy-3d'), { ssr: false, loading: () => <p className="share-hint" role="status">Menyiapkan penampil 3D...</p> })

async function exportPng(svg: SVGSVGElement, width: number, height: number) {
  const source = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(source)
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Gambar gagal diproses.')); image.src = url })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Browser tidak bisa membuat gambar.')
    context.drawImage(image, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG gagal dibuat.')), 'image/png'))
  } finally { URL.revokeObjectURL(url) }
}

export default function ShareWorkoutModal({ workoutId, isOpen, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const captionRef = useRef<HTMLTextAreaElement>(null)
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [palette, setPalette] = useState<SharePalette>('oat')
  const [format, setFormat] = useState<ShareFormat>('post')
  const [layout, setLayout] = useState<ShareLayout>('list')
  const [title, setTitle] = useState('')
  const [handle, setHandle] = useState('')
  const [showHandle, setShowHandle] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [exportRetry, setExportRetry] = useState(0)
  const [exportError, setExportError] = useState(false)
  const [ready, setReady] = useState<{ key: string; file: File } | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const loaded = workout?.id === workoutId ? workout : null
  const summary = useMemo(() => summarizeWorkout(loaded?.sets ?? []), [loaded])
  const usesModel = layout === 'heatmap' || layout === 'combined'
  const modelKey = JSON.stringify([workoutId, summary.muscles, palette, layout === 'combined'])
  const [modelFrame, setModelFrame] = useState<(AnatomyFrame & { key: string }) | null>(null)
  const onModelFrame = useCallback((frame: AnatomyFrame) => setModelFrame(previous => ({ ...frame, key: modelKey, image: frame.status === 'moving' && previous?.key === modelKey ? previous.image : frame.image })), [modelKey])
  const currentModel = modelFrame?.key === modelKey ? modelFrame : null
  const modelPending = usesModel && (!currentModel || currentModel.status === 'moving')
  const bodyImage = usesModel ? currentModel?.image : null
  const date = loaded ? new Date(loaded.startedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const caption = `${title || 'Latihan hari ini'}${showHandle && handle ? ` | ${handle}` : ''}\n${date}\n${loaded?.duration == null ? '' : `${loaded.duration} menit · `}${summary.exercises.length} gerakan · ${summary.sets} set · ${summary.volume.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg volume\n\nSatu sesi lagi. Satu langkah lebih kuat. #GymBro${bodyImage ? '\n\nModel: Écorché / Charleeh; BodyParts3D © DBCLS; Z-Anatomy / Gauthier Kervyn. CC BY-SA 4.0. https://github.com/Charleeh/ecorche' : ''}`
  const exportKey = JSON.stringify([loaded, title, handle, showHandle, palette, format, layout, date, exportRetry, modelPending, bodyImage])
  const file = ready?.key === exportKey ? ready.file : null
  const canShare = !!file && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] }) && !!navigator.share

  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && dialog && !dialog.open) dialog.showModal()
    if (!isOpen && dialog?.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || workoutId == null) return
    let cancelled = false
    setWorkout(null)
    setLoadError(false)
    setMessage('')
    setReady(null)
    setCopied(false)
    setBusy(false)
    getWorkout(workoutId).then(data => {
      if (cancelled) return
      setWorkout(data)
      setTitle(data.name || data.routineName || 'Latihan hari ini')
      setHandle(data.userName || '')
    }).catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [isOpen, workoutId, retry])

  useEffect(() => {
    if (!isOpen || !loaded || modelPending) return
    let cancelled = false
    setExportError(false)
    const timer = setTimeout(async () => {
      if (!svgRef.current) return
      try {
        const size = SHARE_FORMATS[format]
        const blob = await exportPng(svgRef.current, size.width, size.height)
        if (!cancelled) setReady({ key: exportKey, file: new File([blob], shareFilename(title), { type: 'image/png' }) })
      } catch { if (!cancelled) setExportError(true) }
    }, 180)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [isOpen, loaded, exportKey, format, title, modelPending])

  useEffect(() => { setCopied(false); setMessage('') }, [caption, palette, format, layout])

  function download() {
    if (!file) return
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('PNG siap di folder unduhanmu.')
  }

  async function share() {
    if (!file || busy) return
    setBusy(true)
    setMessage('')
    try { await navigator.share({ files: [file], title: title || 'Latihan hari ini', text: caption }); setMessage('Kartu berhasil dibagikan.') }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setMessage('Belum bisa dibagikan. Gunakan Unduh PNG, lalu kirim gambarnya.') }
    finally { setBusy(false) }
  }

  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); setCopied(true); setMessage('Caption tersalin. Tinggal tempel di postinganmu.') }
    catch { captionRef.current?.focus(); captionRef.current?.select(); setMessage('Pilih salin dari teks caption di atas.') }
  }

  return <dialog ref={dialogRef} className="warm-dialog share-editor" aria-labelledby="share-title" aria-describedby="share-description" onClose={onClose}>
    <header className="share-editor-header"><div><p className="section-caption">Dari latihan ke cerita</p><h2 id="share-title">Sesi ini layak dirayakan.</h2><p id="share-description">Bikin kartu latihanmu, lalu bagikan dengan caramu.</p></div><button type="button" className="share-close" aria-label="Tutup editor kartu" onClick={() => dialogRef.current?.close()}><X size={20} /></button></header>
    {loadError ? <div className="share-state" role="alert"><p>Catatan latihan belum bisa dimuat.</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}><RotateCcw size={16} /> Coba lagi</Button></div> : !loaded ? <div className="share-state" role="status"><Loader2 size={24} className="animate-spin" /><p>Menyiapkan catatan latihanmu...</p></div> : <>
      <div className="share-editor-body">
        <section className="share-preview" aria-label="Preview kartu"><div className="share-preview-heading"><span>PREVIEW KARTU</span><span>{SHARE_FORMATS[format].width} × {SHARE_FORMATS[format].height}</span></div><div className={`share-artboard ${palette === 'transparent' ? 'is-transparent' : ''}`}><WorkoutShareCard ref={svgRef} title={title} date={date} duration={loaded.duration} handle={showHandle ? handle : ''} palette={palette} format={format} layout={layout} summary={summary} bodyImage={bodyImage} /></div><p>{palette === 'transparent' ? 'Teks putih tanpa latar. Tempel di atas foto gelapmu.' : 'Preview sama dengan PNG yang akan kamu bagikan.'}</p></section>
        <div className="share-controls">
          <fieldset><legend>Ukuran kartu</legend><div className="share-segments">{(Object.keys(SHARE_FORMATS) as ShareFormat[]).map(key => <button type="button" key={key} aria-pressed={format === key} onClick={() => setFormat(key)}>{SHARE_FORMATS[key].name}<small>{key === 'post' ? '4:5' : key === 'story' ? '9:16' : '1:1'}</small></button>)}</div></fieldset>
          <fieldset><legend>Warna</legend><div className="share-palette-options">{(Object.keys(SHARE_PALETTES) as SharePalette[]).map(key => <button type="button" key={key} aria-pressed={palette === key} onClick={() => setPalette(key)}><span className={`share-swatch ${key === 'transparent' ? 'is-transparent' : ''}`} style={{ backgroundColor: key === 'transparent' ? undefined : SHARE_PALETTES[key].bg, color: SHARE_PALETTES[key].ink }}>{palette === key && <Check size={14} />}</span>{SHARE_PALETTES[key].name}</button>)}</div></fieldset>
          <fieldset><legend>Isi kartu</legend><div className="share-segments">{layouts.map(item => <button type="button" key={item.key} aria-pressed={layout === item.key} onClick={() => setLayout(item.key)}>{item.name}</button>)}</div></fieldset>
          {isOpen && usesModel && <WorkoutAnatomy3D paired={layout === 'heatmap'} accent={SHARE_PALETTES[palette].accent} muscles={summary.muscles} onFrame={onModelFrame} />}
          <div className="share-field"><label htmlFor="share-card-title">Judul sesi</label><input id="share-card-title" value={title} maxLength={80} onChange={e => setTitle(e.target.value)} /></div>
          <div className="share-field"><label htmlFor="share-card-handle">Nama / @username</label><input id="share-card-handle" value={handle} maxLength={38} onChange={e => setHandle(e.target.value)} placeholder="@namamu" /><label className="share-checkbox"><input type="checkbox" checked={showHandle} onChange={e => setShowHandle(e.target.checked)} /> Tampilkan nama di kartu dan caption</label></div>
          <div className="share-field"><div className="share-caption-heading"><label htmlFor="share-card-caption">Caption siap tempel</label><button type="button" onClick={copyCaption}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Tersalin' : 'Salin'}</button></div><textarea ref={captionRef} id="share-card-caption" value={caption} readOnly rows={5} /></div>
          <p className="share-hint">Perubahan judul dan nama di sini hanya untuk kartu. Catatan latihanmu tetap tersimpan seperti semula.</p>
        </div>
      </div>
      <footer className="share-editor-footer"><div className="share-export-status" aria-live="polite">{exportError ? <span role="alert">Gambar gagal dibuat. <button type="button" onClick={() => setExportRetry(value => value + 1)}>Coba lagi</button></span> : modelPending ? 'Menyiapkan pose 3D. Jeda jika model sedang berputar.' : message || (!file ? 'Menyiapkan PNG...' : '')}</div><div className="share-export-actions"><Button variant="outline" disabled={!file || busy} onClick={download}><Download size={17} /> Unduh PNG</Button>{canShare && <Button disabled={!file || busy} onClick={share} className="bg-orange-500 hover:bg-orange-600">{busy ? <Loader2 size={17} className="animate-spin" /> : <Share2 size={17} />}Bagikan</Button>}</div></footer>
    </>}
  </dialog>
}
