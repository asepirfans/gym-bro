'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { GymBroLogo } from '@/components/ui/gymbro-logo'
import { ThemeToggle } from '@/components/theme-toggle'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint = isSignUp ? '/api/manual-auth/sign-up' : '/api/manual-auth/sign-in'
      const payload = isSignUp
        ? { email, password, name }
        : { email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setLoading(false)

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      // Redirect based on sign-up vs sign-in
      if (isSignUp) {
        router.push('/sign-in')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setLoading(false)
      setError('An unexpected error occurred')
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-7 sm:p-9 bg-slate-900">
        <div className="auth-brand-row"><Link href="/" className="brand text-white" aria-label="Kembali ke GymBro"><GymBroLogo className="h-9 w-9" /><span>GymBro.</span></Link><ThemeToggle /></div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? 'Mulai jurnal latihanmu.' : 'Kembali ke ritmemu.'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp
              ? 'Satu akun untuk rutinitas, catatan set, dan progresmu.'
              : 'Masuk untuk melanjutkan catatan dan sesi latihanmu.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 h-12">
            {loading
              ? 'Memproses...'
              : isSignUp
                ? 'Buat akun'
                : 'Masuk'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignUp ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Masuk' : 'Buat akun'}
          </Link>
        </p>
      </Card>
    </main>
  )
}
