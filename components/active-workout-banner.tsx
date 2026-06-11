'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Trash2 } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

export default function ActiveWorkoutBanner({ userId }: { userId?: string }) {
  const router = useRouter()
  const [activeWorkout, setActiveWorkout] = useState<any>(null)
  const { confirm, success } = useToast()

  const storageKey = userId ? `gymbro_active_workout_${userId}` : 'gymbro_active_workout'

  useEffect(() => {
    const checkActive = () => {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed && parsed.workoutStarted) {
            setActiveWorkout(parsed)
            return
          }
        } catch (e) {
          console.error(e)
        }
      }
      setActiveWorkout(null)
    }

    checkActive()
    window.addEventListener('storage', checkActive)
    const interval = setInterval(checkActive, 3000)

    return () => {
      window.removeEventListener('storage', checkActive)
      clearInterval(interval)
    }
  }, [storageKey])

  if (!activeWorkout) return null

  const handleDiscard = () => {
    confirm({
      title: 'Hapus Sesi Aktif?',
      message: 'Sesi workout yang sedang berjalan akan dihapus permanen. Semua progres latihan aktif saat ini akan hilang.',
      danger: true,
      onConfirm: () => {
        localStorage.removeItem(storageKey)
        setActiveWorkout(null)
        success('Sesi dihapus', 'Sesi workout aktif telah dihapus.')
        router.refresh()
      }
    })
  }

  return (
    <Card className="border-orange-500/50 bg-orange-950/10 shadow-sm shadow-orange-950/10 border-2 overflow-hidden mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
          </span>
          <div>
            <p className="font-bold text-white text-sm">
              Workout sedang berjalan!
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Anda memiliki sesi aktif dengan {activeWorkout.exercises?.length || 0} latihan yang belum selesai.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDiscard}
            className="flex-1 sm:flex-none h-9 text-xs border-red-950/50 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:text-red-300 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus Sesi
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/workouts/start')}
            className="flex-1 sm:flex-none h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            Lanjutkan Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
