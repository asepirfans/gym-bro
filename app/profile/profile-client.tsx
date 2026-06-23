'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUserProfile, updateUserProfile } from '@/app/actions/profile'
import { useToast } from '@/components/toast-provider'
import { User, Tag, Mail, Sparkles, Loader2 } from 'lucide-react'

export default function ProfileClient() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { success, error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const profile = await getUserProfile()
        setName(profile.name || '')
        setUsername(profile.username || '')
        setEmail(profile.email || '')
      } catch (err) {
        console.error('Failed to load profile:', err)
        toastError('Gagal Memuat', 'Tidak dapat memuat detail profil Anda.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile({ name, username })
      success('Profil Diperbarui', 'Nama dan Username Anda berhasil disimpan.')
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      toastError('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat memperbarui profil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
        <p className="text-sm text-slate-400">Memuat profil Anda...</p>
      </div>
    )
  }

  return (
    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      {/* Decorative top gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
      
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <User className="h-6 w-6 text-orange-500" />
          Detail Profil
        </CardTitle>
        <CardDescription className="text-slate-400">
          Kelola informasi profil Anda dan atur ID unik untuk berbagi rutinitas.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-500 select-none cursor-not-allowed focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">Email dihubungkan ke sistem autentikasi Anda.</p>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
              required
            />
          </div>

          {/* Unique Username / Share ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Username / ID Berbagi
            </label>
            <div className="relative flex rounded-lg">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-700 bg-slate-950 px-3 text-slate-400 text-sm font-semibold select-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full rounded-r-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
                required
              />
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 p-3 mt-2">
              <p className="text-[11px] text-orange-400/90 leading-relaxed flex gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Mengapa Username penting?</strong> Username ini berfungsi sebagai ID unik Anda. Teman dapat mencari username Anda di menu <strong>Routines</strong> untuk melihat dan mengimpor rutinitas latihan publik yang Anda bagikan.
                </span>
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold h-11 shadow-lg shadow-orange-500/15 cursor-pointer mt-4"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              'Simpan Profil'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
