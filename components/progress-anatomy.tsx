'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { AnatomyFrame } from '@/components/workout-anatomy-3d'
import MuscleHeatmap from '@/components/muscle-heatmap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Anatomy3D = dynamic(() => import('@/components/workout-anatomy-3d'), { ssr: false, loading: () => <p role="status" className="py-12 text-center text-sm text-muted-foreground">Memuat anatomi 3D...</p> })
interface MuscleData { muscle: string; volume: number; reps: number }

export default function ProgressAnatomy({ data }: { data: MuscleData[] }) {
  const [failed, setFailed] = useState(false)
  const [accent, setAccent] = useState('#ad4d31')
  const muscles = useMemo(() => Object.fromEntries(data.map(row => [row.muscle.toLowerCase(), row.volume])), [data])
  const onFrame = useCallback((frame: AnatomyFrame) => { if (frame.status === 'error') setFailed(true) }, [])
  useEffect(() => {
    const sync = () => setAccent(getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#ad4d31')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  if (failed) return <div className="space-y-3"><MuscleHeatmap data={data} /><Button variant="outline" onClick={() => setFailed(false)}>Coba anatomi 3D lagi</Button></div>

  return <Card className="progress-anatomy border-slate-800 bg-slate-900/50">
    <CardHeader><CardTitle>Otot yang kamu latih</CardTitle><CardDescription>Distribusi volume latihanmu</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <Anatomy3D paired accent={accent} muscles={muscles} onFrame={onFrame} mode="progress" />
      <dl className="progress-muscle-stats">{data.map(row => <div key={row.muscle}><dt>{row.muscle}</dt><dd><strong>{row.volume.toLocaleString('id-ID')} kg</strong><span>{row.reps.toLocaleString('id-ID')} reps</span></dd></div>)}</dl>
    </CardContent>
  </Card>
}
