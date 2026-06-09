'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2, Play } from 'lucide-react'
import { getUserRoutines, deleteRoutine } from '@/app/actions/routines'
import { useToast } from '@/components/toast-provider'

interface Routine {
  id: number
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
}

export default function RoutinesClient() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const { confirm, success, error } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserRoutines()
        setRoutines(data as any)
      } catch (err) {
        console.error('Failed to load routines:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = (id: number) => {
    confirm({
      title: 'Hapus Rutinitas?',
      message: 'Rutinitas ini akan dihapus permanen dan tidak bisa dikembalikan.',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteRoutine(id)
          setRoutines(prev => prev.filter((r) => r.id !== id))
          success('Rutinitas dihapus', 'Rutinitas berhasil dihapus.')
        } catch (err) {
          console.error('Failed to delete routine:', err)
          error('Gagal menghapus', 'Terjadi kesalahan, coba lagi.')
        }
      }
    })
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading routines...</div>
  }

  return (
    <div className="space-y-6">
      {routines.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="mb-4 text-slate-400">No routines created yet</p>
          <Link href="/routines/new">
            <Button className="bg-orange-500 hover:bg-orange-600">Create Your First Routine</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {routines.map((routine) => (
            <div key={routine.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{routine.name}</h3>
                {routine.description && <p className="mt-1 text-sm text-slate-400">{routine.description}</p>}
                <div className="mt-2 flex items-center gap-4">
                  <span className={`text-xs font-medium ${routine.isActive ? 'text-green-400' : 'text-slate-400'}`}>
                    {routine.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/workouts/start?routineId=${routine.id}`}>
                  <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600">
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(routine.id)}
                  className="text-red-400 hover:text-red-300 border-slate-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
