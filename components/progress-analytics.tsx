'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Dumbbell, Trash2 } from 'lucide-react'
import { getProgressStats, deleteProgressRecord } from '@/app/actions/dashboard'
import ProgressAnatomy from '@/components/progress-anatomy'
import WorkoutCalendar from '@/components/workout-calendar'
import { useToast } from '@/components/toast-provider'
import BodyWeightTracker from '@/components/body-weight-tracker'

interface ProgressData {
  personalRecords: { id: number; exercise: string; weight: number; maxWeight: number; date: string }[]
  volumeData: { date: string; volume: number }[]
  monthlyProgress: { month: string; workouts: number; totalVolume: number; avgDuration: number }[]
  muscleGroupData: { muscle: string; volume: number; reps: number }[]
}

export default function ProgressAnalytics() {
  return <Tabs defaultValue="training" className="space-y-5"><TabsList><TabsTrigger value="training">Latihan</TabsTrigger><TabsTrigger value="weight">Berat badan</TabsTrigger></TabsList><TabsContent value="training" className="space-y-6"><WorkoutCalendar /><ProgressStatistics /></TabsContent><TabsContent value="weight"><BodyWeightTracker /></TabsContent></Tabs>
}

function ProgressStatistics() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllRecords, setShowAllRecords] = useState(false)
  const { confirm, success, error } = useToast()

  const handleDeletePR = (id: number, exerciseName: string) => {
    confirm({
      title: 'Hapus Personal Record?',
      message: `Personal Record untuk "${exerciseName}" akan dihapus secara permanen dari statistik kemajuan Anda.`,
      danger: true,
      onConfirm: async () => {
        try {
          await deleteProgressRecord(id)
          setData(prev => {
            if (!prev) return null
            return {
              ...prev,
              personalRecords: prev.personalRecords.filter(pr => pr.id !== id)
            }
          })
          success('PR Dihapus', `Personal Record untuk "${exerciseName}" berhasil dihapus.`)
        } catch (err) {
          console.error(err)
          error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus Personal Record.')
        }
      }
    })
  }

  useEffect(() => {
    async function load() {
      try {
        const stats = await getProgressStats()
        setData(stats as any)
      } catch (err) {
        console.error('Failed to fetch progress stats:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Memuat statistik progres...</div>
  }

  const hasData = data && (data.personalRecords.length > 0 || data.monthlyProgress.some(m => m.workouts > 0))

  if (!hasData) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="mx-auto rounded-lg bg-orange-500/10 p-4 w-16 h-16 flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Catatan pertamamu ditunggu di sini.</h3>
          <p className="text-slate-400 text-sm">
            Selesaikan satu sesi, lalu lihat catatan beban, volume, dan rekor pribadimu tumbuh dari waktu ke waktu.
          </p>
        </div>
        <Link href="/workouts/start">
          <Button className="bg-orange-500 hover:bg-orange-600 mt-2">Mulai latihan pertamamu</Button>
        </Link>
      </Card>
    )
  }

  // Calculate high-level stats
  const totalWorkouts = data.monthlyProgress.reduce((sum, m) => sum + m.workouts, 0)
  const totalVolume = data.monthlyProgress.reduce((sum, m) => sum + m.totalVolume, 0)
  const avgDurationArr = data.monthlyProgress.filter(m => m.avgDuration > 0)
  const avgDuration = avgDurationArr.length > 0
    ? Math.round(avgDurationArr.reduce((sum, m) => sum + m.avgDuration, 0) / avgDurationArr.length)
    : 0

  const stats = [
    { label: 'Sesi latihan', value: totalWorkouts.toString(), change: '6 bulan terakhir' },
    { label: 'Total volume', value: `${totalVolume.toLocaleString()} kg`, change: '6 bulan terakhir' },
    {
      label: 'Rata-rata durasi',
      value: avgDuration < 60
        ? `${avgDuration} min`
        : `${Math.floor(avgDuration / 60)} jam${avgDuration % 60 > 0 ? ` ${avgDuration % 60} min` : ''}`,
      change: 'Ringkasan durasi bulanan'
    },
    { label: 'Rekor pribadi', value: data.personalRecords.length.toString(), change: 'Gerakan yang tercatat' },
  ]

  // Construct radar chart data
  const maxVolume = Math.max(...data.muscleGroupData.map(m => m.volume), 1)
  const radarData = data.muscleGroupData.map(m => ({
    name: m.muscle,
    value: Math.round((m.volume / maxVolume) * 100)
  }))

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-800 bg-slate-900/50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-400 font-semibold">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Records Section */}
      {data.personalRecords.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Angkatan terbaikmu</CardTitle>
            <CardDescription>Catatan beban terbaru dan rekor pribadimu</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="personal-records-list" className="grid gap-4 md:grid-cols-2">
              {(showAllRecords ? data.personalRecords : data.personalRecords.slice(0, 5)).map((pr) => {
                const diff = pr.weight - pr.maxWeight
                const isDown = diff < 0

                return (
                  <div key={pr.exercise} className="relative rounded-lg border border-slate-700 bg-slate-800/50 p-4 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-slate-400 font-semibold">{pr.exercise}</p>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePR(pr.id, pr.exercise)}
                          aria-label={`Hapus rekor ${pr.exercise}`}
                          className="h-11 w-11 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-baseline gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Terbaru</span>
                          <span className="text-2xl font-bold text-white">{pr.weight} kg</span>
                        </div>
                        <div className="h-8 w-px bg-slate-700 self-end mb-1" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Tertinggi (PR)</span>
                          <span className="text-2xl font-bold text-orange-500">{pr.maxWeight} kg</span>
                        </div>
                      </div>

                      {pr.maxWeight > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                          {pr.weight === pr.maxWeight ? (
                            <span className="text-emerald-400 bg-emerald-950/20 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-900/30">
                              Beban Tertinggi Aktif
                            </span>
                          ) : isDown ? (
                            <span className="text-red-400 bg-red-950/20 px-2.5 py-0.5 rounded-full font-semibold border border-red-900/30">
                              Turun {Math.abs(diff)} kg dari PR
                            </span>
                          ) : (
                            <span className="text-slate-400 bg-slate-950/20 px-2.5 py-0.5 rounded-full font-semibold border border-slate-800">
                              Beban stabil
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-3 text-[10px] text-slate-500 font-medium">
                      Dicatat: {new Date(pr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>
            {data.personalRecords.length > 5 && <div className="mt-5 flex justify-center"><Button variant="outline" aria-controls="personal-records-list" aria-expanded={showAllRecords} onClick={() => setShowAllRecords(value => !value)}>{showAllRecords ? 'Tampilkan lebih sedikit' : `Tampilkan lainnya (${data.personalRecords.length - 5})`}</Button></div>}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          <TabsTrigger value="muscles">Kelompok otot</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Ritme latihan bulanan</CardTitle>
              <CardDescription>Jumlah sesi yang sudah kamu selesaikan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6ddcf" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="workouts" name="Sesi selesai" fill="var(--chart-bar)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Pelan-pelan, bertambah</CardTitle>
              <CardDescription>Total volume latihan setiap bulan, dalam kg</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6ddcf" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Line type="monotone" dataKey="totalVolume" name="Volume (kg)" stroke="var(--chart-line)" strokeWidth={3} dot={{ fill: 'var(--chart-line)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muscles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ProgressAnatomy data={data.muscleGroupData} />

            {radarData.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Kenali keseimbanganmu</CardTitle>
                  <CardDescription>Perbandingan volume antar kelompok otot</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={310}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--muted-foreground)" />
                      <Radar name="Volume relatif" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Volume per kelompok otot</CardTitle>
              <CardDescription>Kelompok otot yang sudah kamu latih</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.muscleGroupData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6ddcf" />
                  <XAxis type="number" stroke="var(--muted-foreground)" />
                  <YAxis dataKey="muscle" type="category" stroke="var(--muted-foreground)" width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="volume" name="Volume (kg)" fill="var(--chart-bar)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
