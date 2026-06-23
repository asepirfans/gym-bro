'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2, Play, Dumbbell, User, Sparkles, Share2, Check, X, RefreshCw, Loader2, Mail, Send } from 'lucide-react'
import { getUserRoutines, getTemplateRoutines, deleteRoutine, shareRoutineToUser, getPendingSharedRoutines, respondToSharedRoutine } from '@/app/actions/routines'
import { useToast } from '@/components/toast-provider'

interface Routine {
  id: number
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
}

interface PendingShare {
  id: number
  routineId: number
  routineName: string
  routineDescription?: string | null
  senderName: string
  senderUsername: string | null
  createdAt: Date
}

export default function RoutinesClient() {
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([])
  const [templateRoutines, setTemplateRoutines] = useState<Routine[]>([])
  const [pendingShares, setPendingShares] = useState<PendingShare[]>([])
  const [activeTab, setActiveTab] = useState<'custom' | 'templates' | 'shared'>('custom')
  const [loading, setLoading] = useState(true)
  const { confirm, success, error } = useToast()

  // Share Modal State
  const [sharingRoutineId, setSharingRoutineId] = useState<number | null>(null)
  const [shareTargetUsername, setShareTargetUsername] = useState('')
  const [shareLoading, setShareLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [customData, templateData, sharedData] = await Promise.all([
          getUserRoutines(),
          getTemplateRoutines(),
          getPendingSharedRoutines(),
        ])
        setCustomRoutines(customData as any)
        setTemplateRoutines(templateData as any)
        setPendingShares(sharedData as any)
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
          setCustomRoutines((prev) => prev.filter((r) => r.id !== id))
          success('Rutinitas dihapus', 'Rutinitas berhasil dihapus.')
        } catch (err) {
          console.error('Failed to delete routine:', err)
          error('Gagal menghapus', 'Terjadi kesalahan, coba lagi.')
        }
      },
    })
  }

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sharingRoutineId || !shareTargetUsername.trim()) return
    setShareLoading(true)
    try {
      await shareRoutineToUser(sharingRoutineId, shareTargetUsername)
      success('Rutinitas Dikirim', `Rutinitas berhasil dibagikan kepada @${shareTargetUsername}`)
      setSharingRoutineId(null)
      setShareTargetUsername('')
    } catch (err: any) {
      console.error('Failed to share:', err)
      error('Gagal Membagikan', err.message || 'Terjadi kesalahan saat membagikan rutinitas.')
    } finally {
      setShareLoading(false)
    }
  }

  const handleRespond = async (shareId: number, action: 'accept' | 'decline') => {
    try {
      await respondToSharedRoutine(shareId, action)
      success(
        action === 'accept' ? 'Diterima' : 'Ditolak',
        action === 'accept'
          ? 'Rutinitas berhasil ditambahkan ke daftar kustom Anda.'
          : 'Berbagi rutinitas berhasil ditolak.'
      )
      // Reload routines
      const [customData, sharedData] = await Promise.all([
        getUserRoutines(),
        getPendingSharedRoutines(),
      ])
      setCustomRoutines(customData as any)
      setPendingShares(sharedData as any)
      if (action === 'accept') {
        setActiveTab('custom')
      }
    } catch (err) {
      console.error('Failed to respond:', err)
      error('Gagal memproses', 'Terjadi kesalahan saat memproses rutinitas.')
    }
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading routines...</div>
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs (Pill style - NO count numbers in headers) */}
      <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 max-w-lg mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'custom'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <User className="h-4 w-4" />
          Custom
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'templates'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative ${
            activeTab === 'shared'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Mail className="h-4 w-4" />
          Shared
          {pendingShares.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {pendingShares.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: CUSTOM ROUTINES */}
      {activeTab === 'custom' && (
        customRoutines.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center max-w-2xl mx-auto mt-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Rutinitas Kustom</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Buat rutinitas latihan kustom pertama Anda untuk melacak olahraga harian Anda.
            </p>
            <Link href="/routines/new">
              <Button className="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25">
                Buat Rutinitas Pertama
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {customRoutines.map((routine) => (
              <div
                key={routine.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/35 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-orange-500/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg text-white group-hover:text-orange-400 transition-colors">
                      {routine.name}
                    </h3>
                    <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                      Custom
                    </span>
                  </div>
                  {routine.description && (
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{routine.description}</p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                  <span className="text-xs text-slate-500">
                    {routine.createdAt
                      ? `Dibuat: ${new Date(routine.createdAt).toLocaleDateString('id-ID')}`
                      : 'Kustom'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link href={`/workouts/start?routineId=${routine.id}`}>
                      <Button size="sm" className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md shadow-orange-500/10 cursor-pointer">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Start
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSharingRoutineId(routine.id)}
                      className="text-slate-300 hover:text-orange-400 border-slate-850 bg-slate-900/30 hover:bg-slate-850 cursor-pointer"
                      title="Bagikan ke Teman"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(routine.id)}
                      className="text-red-400 hover:text-red-300 border-slate-850 bg-slate-900/30 hover:bg-red-950/20 hover:border-red-900/30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab: SYSTEM TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {templateRoutines.map((routine) => (
            <div
              key={routine.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/35 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-lg text-white group-hover:text-orange-400 transition-colors">
                    {routine.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md">
                    Template
                  </span>
                </div>
                {routine.description && (
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{routine.description}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                <span className="text-xs text-slate-500">Bawaan Sistem</span>
                <Link href={`/workouts/start?routineId=${routine.id}`}>
                  <Button size="sm" className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md shadow-orange-500/10 cursor-pointer">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Start
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: SHARED INBOX */}
      {activeTab === 'shared' && (
        pendingShares.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center max-w-2xl mx-auto mt-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Inbox Berbagi Kosong</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Belum ada rutinitas latihan masuk dari teman-teman Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {pendingShares.map((share) => (
              <div
                key={share.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-900/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg text-white">{share.routineName}</h3>
                    <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md">
                      Inbox
                    </span>
                  </div>
                  {share.routineDescription && (
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{share.routineDescription}</p>
                  )}
                  <p className="mt-3 text-xs text-orange-400 font-medium">
                    Dibagikan oleh: {share.senderName} {share.senderUsername && `(@${share.senderUsername})`}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                  <span className="text-xs text-slate-500">
                    {new Date(share.createdAt).toLocaleDateString('id-ID')}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(share.id, 'decline')}
                      className="text-red-400 hover:text-red-300 border-slate-800 bg-slate-900/30 hover:bg-red-950/20 hover:border-red-900/30 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Tolak
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRespond(share.id, 'accept')}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium cursor-pointer shadow-md shadow-orange-500/10"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Terima
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* SHARE MODAL DIALOG */}
      {sharingRoutineId !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-850 bg-slate-900 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-600"></div>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-orange-500" />
                Bagikan Rutinitas
              </h3>
              <button
                onClick={() => setSharingRoutineId(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Kirim rutinitas latihan ini langsung ke inbox teman Anda menggunakan username mereka.
            </p>

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Username Teman Penerima
                </label>
                <div className="relative flex rounded-lg">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-700 bg-slate-950 px-3 text-slate-400 text-sm font-semibold select-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={shareTargetUsername}
                    onChange={(e) => setShareTargetUsername(e.target.value)}
                    placeholder="username"
                    required
                    className="w-full rounded-r-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setSharingRoutineId(null)}
                  variant="outline"
                  className="flex-1 border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-800 cursor-pointer h-10"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={shareLoading || !shareTargetUsername.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  {shareLoading ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Send className="h-3.5 w-3.5" />
                      Kirim
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
