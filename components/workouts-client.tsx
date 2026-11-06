'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, Share2, Edit2, Check, X } from 'lucide-react'
import { deleteWorkout, updateWorkoutName } from '@/app/actions/workouts'
import ShareWorkoutModal from '@/components/share-workout-modal'
import ActiveWorkoutBanner from '@/components/active-workout-banner'
import WorkoutCalendar from '@/components/workout-calendar'
import { useToast } from '@/components/toast-provider'

interface Workout {
  id: number
  name: string | null
  routineName: string | null
  startedAt: Date
  completedAt: Date | null
  duration: number | null
  notes: string | null
}

export default function WorkoutsClient({ userId, initialWorkouts }: { userId: string; initialWorkouts: Workout[] }) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [showAll, setShowAll] = useState(false)
  const [timeZone, setTimeZone] = useState('UTC')
  const [shareWorkoutId, setShareWorkoutId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const { confirm, success, error } = useToast()

  useEffect(() => { setWorkouts(initialWorkouts) }, [initialWorkouts])
  useEffect(() => { setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone) }, [])

  const handleDelete = (id: number) => {
    confirm({
      title: 'Hapus Workout Log?',
      message: 'Sesi latihan ini akan dihapus permanen dan tidak bisa dikembalikan.',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteWorkout(id)
          setWorkouts(prev => prev.filter((w) => w.id !== id))
          success('Workout dihapus', 'Sesi latihan berhasil dihapus.')
        } catch (err) {
          console.error('Failed to delete workout:', err)
          error('Gagal menghapus', 'Terjadi kesalahan, coba lagi.')
        }
      }
    })
  }

  const handleSaveName = async (id: number) => {
    if (!editValue.trim()) return
    try {
      await updateWorkoutName(id, editValue.trim())
      setWorkouts(workouts.map((w) => w.id === id ? { ...w, name: editValue.trim() } : w))
      setEditingId(null)
      success('Nama diperbarui', 'Nama workout berhasil disimpan.')
    } catch (err) {
      console.error('Failed to update workout name:', err)
      error('Gagal menyimpan', 'Nama workout tidak bisa diperbarui.')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <ActiveWorkoutBanner userId={userId} />
      <WorkoutCalendar workouts={workouts} />
      {workouts.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="mb-4 text-slate-400">Belum ada sesi.</p>
          <Link href="/workouts/start">
            <Button className="bg-orange-500 hover:bg-orange-600">Mulai latihan</Button>
          </Link>
        </Card>
      ) : (
        <><div id="workout-history-list" className="grid gap-4">
          {(showAll ? workouts : workouts.slice(0, 5)).map((workout) => (
            <Card key={workout.id} className="history-row border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingId === workout.id ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-white focus:outline-none focus:border-orange-500 font-semibold"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveName(workout.id)}
                        aria-label="Simpan nama sesi"
                        className="text-green-400 hover:text-green-300 hover:bg-slate-800 h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        aria-label="Batalkan perubahan nama"
                        className="text-red-400 hover:text-red-300 hover:bg-slate-800 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {workout.name || workout.routineName || 'Quick Workout'}
                      </h3>
                      <button
                        aria-label={`Ubah nama sesi ${workout.name || workout.routineName || 'Latihan bebas'}`}
                        onClick={() => {
                          setEditingId(workout.id)
                          setEditValue(workout.name || workout.routineName || 'Quick Workout')
                        }}
                        className="text-slate-400 hover:text-slate-300 p-1 rounded transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                    <span>{formatDate(workout.startedAt)}</span>
                     {workout.duration && (
                       <span>
                         {workout.duration < 60
                           ? `${workout.duration} min`
                           : `${Math.floor(workout.duration / 60)} jam${workout.duration % 60 > 0 ? ` ${workout.duration % 60} min` : ''}`}
                       </span>
                     )}
                    {workout.notes && <span className="text-slate-300 italic">"{workout.notes}"</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShareWorkoutId(workout.id)}
                    className="text-orange-400 hover:text-orange-300 border-slate-700 hover:bg-slate-800 gap-1.5"
                  >
                    <Share2 className="h-4 w-4" />
                    Bagikan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(workout.id)}
                    aria-label={`Hapus sesi ${workout.name || workout.routineName || 'Latihan bebas'}`}
                    className="text-red-400 hover:text-red-300 border-slate-700 hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>{workouts.length > 5 && <div className="flex justify-center"><Button variant="outline" aria-controls="workout-history-list" aria-expanded={showAll} onClick={() => setShowAll(value => !value)}>{showAll ? 'Tampilkan lebih sedikit' : `Tampilkan lainnya (${workouts.length - 5})`}</Button></div>}</>
      )}

      <ShareWorkoutModal
        workoutId={shareWorkoutId}
        isOpen={shareWorkoutId !== null}
        onClose={() => setShareWorkoutId(null)}
      />
    </div>
  )
}
