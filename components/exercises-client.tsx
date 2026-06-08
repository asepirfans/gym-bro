'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { getExercises } from '@/app/actions/exercises'

const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']
const categoryColors: Record<string, string> = {
  chest: 'bg-orange-500',
  back: 'bg-blue-500',
  legs: 'bg-purple-500',
  shoulders: 'bg-pink-500',
  arms: 'bg-green-500',
  core: 'bg-yellow-500',
}

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
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getExercises()
        setExercises(data as any)
        setFilteredExercises(data as any)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    let filtered = exercises

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredExercises(filtered)
  }, [selectedCategory, searchTerm, exercises])

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading exercises...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 pl-10"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selectedCategory === null
              ? 'bg-slate-400 text-slate-950'
              : 'border border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition capitalize ${
              selectedCategory === cat
                ? `${categoryColors[cat]} text-white`
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
          <div key={ex.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{ex.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{ex.description}</p>
              </div>
              <Badge className={`${categoryColors[ex.category]} text-white capitalize`}>
                {ex.category}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-400">No exercises found</p>
        </div>
      )}
    </div>
  )
}
