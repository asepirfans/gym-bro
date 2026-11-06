'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { getExercises } from '@/app/actions/exercises'

const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']
interface Exercise {
  id: number
  name: string
  description: string | null
  category: string
  imageUrl: string | null
  createdAt: Date
}

export default function ExercisesClient() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getExercises()
        setExercises(data as any)
      } catch (err) {
        console.error(err)
        setLoadFailed(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredExercises = exercises.filter(exercise =>
    (!selectedCategory || exercise.category.toLowerCase() === selectedCategory) &&
    (!searchTerm || exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) || exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div role="status" className="text-center text-slate-400 py-12">Menyiapkan gerakan latihan...</div>
  }
  if (loadFailed) return <div role="alert" className="rounded-2xl border border-border bg-card p-8 text-center space-y-4"><p>Gerakan latihan belum bisa dimuat. Coba sebentar lagi, ya.</p><button className="app-secondary-action" onClick={() => window.location.reload()}>Coba lagi</button></div>

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Mau latihan gerakan apa?"
          aria-label="Cari gerakan latihan"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 pl-10"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          aria-pressed={selectedCategory === null}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selectedCategory === null
              ? 'bg-orange-500 text-primary-foreground'
              : 'border border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
            className={`rounded-full px-4 py-2 text-sm font-medium transition capitalize ${
              selectedCategory === cat
                ? 'bg-orange-500 text-primary-foreground'
                : 'border border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((ex) => (
          <div key={ex.id} className="exercise-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{ex.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{ex.description}</p>
              </div>
              <Badge className="bg-muted text-muted-foreground capitalize shrink-0">
                {ex.category}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-400">Belum ada gerakan yang cocok. Coba nama atau kategori lain.</p>
        </div>
      )}
    </div>
  )
}
