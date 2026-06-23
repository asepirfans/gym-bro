'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GymBroLogo } from '@/components/ui/gymbro-logo'
import { 
  Dumbbell, 
  Flame, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Shield, 
  Calendar, 
  Award, 
  Users, 
  Check 
} from 'lucide-react'

// Informasi kelompok otot untuk peta interaktif
const muscleInfo = {
  chest: {
    name: 'Dada / Pectorals',
    description: 'Membangun kekuatan dorong tubuh bagian atas. Memiliki kepadatan serat otot cepat yang tinggi.',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Chest Flyes']
  },
  shoulders: {
    name: 'Bahu / Deltoids',
    description: 'Menjaga stabilitas bahu dan membentuk siluet tubuh V-taper yang lebar.',
    exercises: ['Overhead Barbell Press', 'Dumbbell Lateral Raises', 'Face Pulls']
  },
  abs: {
    name: 'Perut / Core',
    description: 'Stabilitas inti tubuh mendukung semua angkatan berat (compound lift) dan postur tubuh yang baik.',
    exercises: ['Hanging Leg Raises', 'Plank Hold', 'Cable Crunches']
  },
  arms: {
    name: 'Lengan / Bicep & Tricep',
    description: 'Mengisolasi kelompok otot lengan untuk memaksimalkan hipertrofi dan kekuatan genggaman tangan.',
    exercises: ['Incline Bicep Curls', 'Tricep Rope Pushdowns', 'Hammer Curls']
  },
  quads: {
    name: 'Paha & Kaki / Quads',
    description: 'Fondasi utama dari seluruh kekuatan tubuh. Latihan squat dan ekstensi mengaktifkan pembakaran metabolik maksimal.',
    exercises: ['Barbell Back Squats', 'Leg Press', 'Romanian Deadlifts']
  }
}

export default function LandingPage() {
  const [hoveredMuscle, setHoveredMuscle] = useState<keyof typeof muscleInfo | null>(null)
  
  // State Simulasi Interaktif
  const [completedSets, setCompletedSets] = useState([false, false, false])
  const [currentVolume, setCurrentVolume] = useState(0)
  const [simulationStreak, setSimulationStreak] = useState(4)

  const toggleSet = (index: number, weight: number, reps: number) => {
    const nextSets = [...completedSets]
    nextSets[index] = !nextSets[index]
    setCompletedSets(nextSets)

    // Hitung volume baru yang disimulasikan
    const volumeChange = weight * reps
    if (nextSets[index]) {
      setCurrentVolume(prev => prev + volumeChange)
      // Jika set terakhir dicentang, kita naikkan streak untuk efek visual
      if (nextSets.every(s => s)) {
        setSimulationStreak(5)
      }
    } else {
      setCurrentVolume(prev => prev - volumeChange)
      if (!nextSets.every(s => s)) {
        setSimulationStreak(4)
      }
    }
  }

  const resetSimulation = () => {
    setCompletedSets([false, false, false])
    setCurrentVolume(0)
    setSimulationStreak(4)
  }

  const isSimulationComplete = completedSets.every(s => s)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20 opacity-50" />

      {/* Navbar */}
      <header className="sticky top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GymBroLogo className="h-10 w-10 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              GymBro
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#demo-interaktif" className="hover:text-white transition-colors">Coba Logger</a>
            <a href="#peta-otot" className="hover:text-white transition-colors">Target Otot</a>
            <a href="#mengapa-gymbro" className="hover:text-white transition-colors">Mengapa Kami</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-900 cursor-pointer">
                Masuk
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-none shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all cursor-pointer">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Copywriting & CTAs */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-semibold tracking-wide animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span>Pendamping Latihan Generasi Terbaru</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Latihan Lebih Cerdas.
            <span className="block mt-2 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              Angkat Lebih Berat.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
            GymBro mempermudah konsistensi Anda. Rancang rutinitas latihan, catat total volume angkatan, visualisasikan kelelahan otot secara real-time, dan jaga agar streak latihan Anda tetap menyala. Bebas iklan dan dioptimalkan untuk performa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-base py-6 px-8 rounded-xl border-none shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] transition-all cursor-pointer">
                Mulai Catat Gratis
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
            <a href="#demo-interaktif" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/40 backdrop-blur text-slate-300 py-6 px-8 rounded-xl hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                Coba Demo Interaktif
              </Button>
            </a>
          </div>

          {/* Floating Metric Stats on Desktop */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-900 max-w-md mx-auto lg:mx-0">
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-white">100%</span>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Privasi Aman</span>
            </div>
            <div className="space-y-1 border-x border-slate-900 px-4">
              <span className="block text-2xl font-bold text-white">0s</span>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Tanpa Iklan</span>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-white">Live</span>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Peta Otot</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive App Mockup & Floating Cards */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          {/* Main Visual: Glassmorphic Floating Widget */}
          <div className="relative w-full max-w-[380px] bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden group">
            {/* Visual Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Profil Dinamis</h3>
                  <span className="text-xs text-slate-400">Pelacakan Aktif GymBro</span>
                </div>
              </div>
              
              {/* Evolving Streak Flame */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 py-1 px-2.5 rounded-full">
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-bounce" />
                <span className="text-xs font-bold text-white">Streak 5 Minggu</span>
              </div>
            </div>

            {/* Interactive Graph Widget Design */}
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-slate-400">Target Volume Mingguan</span>
                  <span className="text-xs font-bold text-orange-500">82% Tercapai</span>
                </div>
                {/* Simulated Graph bars */}
                <div className="flex items-end gap-2 h-20 pt-4">
                  <div className="w-full bg-slate-900 h-[30%] rounded-md hover:bg-orange-500/20 transition-all" />
                  <div className="w-full bg-slate-900 h-[45%] rounded-md hover:bg-orange-500/20 transition-all" />
                  <div className="w-full bg-slate-900 h-[60%] rounded-md hover:bg-orange-500/20 transition-all" />
                  <div className="w-full bg-slate-900 h-[40%] rounded-md hover:bg-orange-500/20 transition-all" />
                  <div className="w-full bg-orange-500 h-[82%] rounded-md shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse" />
                  <div className="w-full bg-slate-900 h-[10%] rounded-md" />
                  <div className="w-full bg-slate-900 h-[15%] rounded-md" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 mt-2">
                  <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
                </div>
              </div>

              {/* Progress Stat Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Beban</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold text-white">42.650</span>
                    <span className="text-[10px] text-slate-400">kg</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sesi Latihan</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold text-white">38</span>
                    <span className="text-[10px] text-slate-400">sesi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Metric 1 */}
          <div className="absolute top-12 -left-12 hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-2xl hover:translate-y-[-2px] transition-transform duration-300 select-none">
            <div className="bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400">Performa Latihan</span>
              <span className="text-sm font-bold text-white">Kemajuan +12,4%</span>
            </div>
          </div>

          {/* Floating Metric 2 */}
          <div className="absolute bottom-6 -right-10 hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-2xl hover:translate-y-[-2px] transition-transform duration-300 select-none">
            <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400">Fokus Konsistensi</span>
              <span className="text-sm font-bold text-white">Dada, Paha, Lengan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Showcase */}
      <section id="fitur" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-orange-500 text-sm font-semibold tracking-wider uppercase">Fitur Unggulan</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Semua yang Anda butuhkan untuk berkembang.</h2>
          <p className="text-slate-400">Tanpa spreadsheet rumit, tanpa kalkulator penuh iklan. Hanya alat bersih yang dirancang khusus untuk kekuatan dan kecepatan mencatat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card className="bg-slate-900/30 border-slate-900 p-6 rounded-2xl hover:border-orange-500/20 hover:bg-slate-900/50 transition-all group duration-300">
            <div className="bg-orange-500/10 border border-orange-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Rutinitas Kustom</h3>
            <p className="text-sm text-slate-400">Buat template latihan untuk PPL, Upper/Lower, atau program split Anda sendiri. Catat set latihan dalam hitungan detik.</p>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-slate-900/30 border-slate-900 p-6 rounded-2xl hover:border-orange-500/20 hover:bg-slate-900/50 transition-all group duration-300">
            <div className="bg-blue-500/10 border border-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Heatmap Interaktif</h3>
            <p className="text-sm text-slate-400">Visualisasikan kelelahan kelompok otot Anda berdasarkan latihan yang dicatat. Jaga keseimbangan pembentukan otot tubuh.</p>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-slate-900/30 border-slate-900 p-6 rounded-2xl hover:border-orange-500/20 hover:bg-slate-900/50 transition-all group duration-300">
            <div className="bg-purple-500/10 border border-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Streak yang Berkembang</h3>
            <p className="text-sm text-slate-400">Jaga konsistensi tetap aktif. Warna api streak Anda akan naik level dari oranye ke biru dan ungu seiring bertambahnya minggu konsisten.</p>
          </Card>

          {/* Feature 4 */}
          <Card className="bg-slate-900/30 border-slate-900 p-6 rounded-2xl hover:border-orange-500/20 hover:bg-slate-900/50 transition-all group duration-300">
            <div className="bg-emerald-500/10 border border-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Analisis Kemajuan</h3>
            <p className="text-sm text-slate-400">Petakan estimasi 1RM, volume latihan mingguan, dan perkembangan rekor pribadi Anda secara otomatis dalam bentuk grafik.</p>
          </Card>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo-interaktif" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1 px-3 rounded-full text-xs font-semibold text-orange-400">
              <Activity className="h-3 w-3" />
              <span>Simulasi Langsung</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Coba catat set Anda sekarang.</h2>
            <p className="text-slate-400">
              Rasakan antarmuka GymBro yang super cepat dan mulus. Klik tombol centang pada kartu simulator untuk mencatat setiap set latihan Anda. Lihat volume total dan indikator streak merespons langsung.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-slate-300">Mencatat dengan sekali ketuk menjaga ritme latihan Anda tetap terjaga.</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-slate-300">Volume akumulatif dihitung otomatis saat set dicentang.</span>
              </div>
            </div>
          </div>

          {/* Right Demo Card Widget */}
          <div className="lg:col-span-7 flex justify-center">
            <Card className="w-full max-w-[460px] bg-slate-900/50 backdrop-blur border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              {/* Card Glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Aktivitas Latihan</span>
                  <h3 className="text-lg font-bold text-white">Bench Press</h3>
                </div>
                
                {/* Simulated Streak */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 py-1 px-2.5 rounded-full transition-all duration-300">
                  <Flame className={`h-4 w-4 transition-all ${simulationStreak === 5 ? 'text-blue-500 fill-blue-500 animate-pulse' : 'text-orange-500 fill-orange-500'}`} />
                  <span className="text-xs font-bold text-white">Streak {simulationStreak} Minggu</span>
                </div>
              </div>

              {/* Logger Table */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-4 text-center">Beban (kg)</div>
                  <div className="col-span-4 text-center">Reps</div>
                  <div className="col-span-2 text-right">Catat</div>
                </div>

                {/* Set Row 1 */}
                <div className={`grid grid-cols-12 items-center py-2 px-3 rounded-xl border transition-all ${completedSets[0] ? 'bg-orange-500/5 border-orange-500/20' : 'bg-slate-950/40 border-slate-900/60'}`}>
                  <div className="col-span-2 text-sm font-bold text-white">1</div>
                  <div className="col-span-4 text-center text-sm font-semibold text-slate-300">60 kg</div>
                  <div className="col-span-4 text-center text-sm font-semibold text-slate-300">8 rep</div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => toggleSet(0, 60, 8)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${completedSets[0] ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                      {completedSets[0] && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Set Row 2 */}
                <div className={`grid grid-cols-12 items-center py-2 px-3 rounded-xl border transition-all ${completedSets[1] ? 'bg-orange-500/5 border-orange-500/20' : 'bg-slate-950/40 border-slate-900/60'}`}>
                  <div className="col-span-2 text-sm font-bold text-white">2</div>
                  <div className="col-span-4 text-center text-sm font-semibold text-slate-300">70 kg</div>
                  <div className="col-span-4 text-center text-sm font-semibold text-slate-300">8 rep</div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => toggleSet(1, 70, 8)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${completedSets[1] ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                      {completedSets[1] && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Set Row 3 */}
                <div className={`grid grid-cols-12 items-center py-2 px-3 rounded-xl border transition-all ${completedSets[2] ? 'bg-orange-500/5 border-orange-500/20' : 'bg-slate-950/40 border-slate-900/60'}`}>
                  <div className="col-span-2 text-sm font-bold text-white">3</div>
                  <div className="col-span-4 text-center text-sm font-semibold text-slate-300">80 kg</div>
                  <div className="col-span-4 text-center text-sm font-semibold text-slate-300">6 rep</div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => toggleSet(2, 80, 6)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${completedSets[2] ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                      {completedSets[2] && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Volume display & simulated stats updates */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Volume Latihan Sesi Ini</span>
                  <div className="text-xl font-extrabold text-white mt-0.5 transition-all">
                    {currentVolume} <span className="text-xs font-semibold text-slate-400">kg</span>
                  </div>
                </div>

                {isSimulationComplete ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md animate-bounce">
                      Semua set tercatat!
                    </span>
                    <button 
                      onClick={resetSimulation}
                      className="text-[10px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
                    >
                      Reset Sim
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Centang semua set untuk naik streak</span>
                )}
              </div>

              {/* Post-sim CTA display overlay */}
              {isSimulationComplete && (
                <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col items-center text-center space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Streak meningkat menjadi 5 minggu! (+15% Volume hari ini)</span>
                  </div>
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white border-none py-5 rounded-xl text-sm font-semibold cursor-pointer">
                      Simpan Catatan Latihan Anda Sekarang (Gratis)
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Muscle Heatmap Section */}
      <section id="peta-otot" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-orange-500 text-sm font-semibold tracking-wider uppercase">Visual Target</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Keseimbangan Otot Interaktif</h2>
          <p className="text-slate-400">Visualisasikan bagian tubuh mana yang paling sering Anda latih. Arahkan kursor ke kelompok otot pada bagan anatomi tubuh untuk menjelajahi latihan teratas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-900/20 border border-slate-900 rounded-3xl p-6 md:p-12 max-w-4xl mx-auto">
          {/* Anatomical SVG Side */}
          <div className="md:col-span-5 flex justify-center">
            {/* Torso SVG */}
            <div className="relative p-4 bg-slate-950/60 rounded-2xl border border-slate-900/60">
              <svg viewBox="0 0 200 280" className="w-[180px] h-auto drop-shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                {/* Head & Neck */}
                <circle cx="100" cy="30" r="14" className="fill-slate-800/40 stroke-slate-700 stroke-2" />
                <path d="M95 43 L105 43 L103 52 L97 52 Z" className="fill-slate-800/40 stroke-slate-700 stroke-2" />
                
                {/* Left Shoulder */}
                <path d="M72 58 C63 58 56 66 56 74 C56 78 59 82 64 82 C68 82 73 74 76 70 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'shoulders' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('shoulders')}
                      onMouseLeave={() => setHoveredMuscle(null)} />
                      
                {/* Right Shoulder */}
                <path d="M128 58 C137 58 144 66 144 74 C144 78 141 82 136 82 C132 82 127 74 124 70 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'shoulders' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('shoulders')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Left Chest */}
                <path d="M77 71 L97 71 L97 93 L73 89 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'chest' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('chest')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Right Chest */}
                <path d="M123 71 L103 71 L103 93 L127 89 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'chest' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('chest')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Abs / Core */}
                <path d="M81 97 L119 97 L115 142 L85 142 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'abs' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('abs')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Left Arm */}
                <path d="M55 76 C47 83 44 91 44 104 C44 108 48 112 53 112 C57 112 60 99 64 91 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'arms' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('arms')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Right Arm */}
                <path d="M145 76 C153 83 156 91 156 104 C156 108 152 112 147 112 C143 112 140 99 136 91 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'arms' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('arms')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Left Quad */}
                <path d="M82 147 L98 147 L96 205 L76 197 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'quads' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('quads')}
                      onMouseLeave={() => setHoveredMuscle(null)} />

                {/* Right Quad */}
                <path d="M118 147 L102 147 L104 205 L124 197 Z" 
                      className={`transition-all duration-300 cursor-pointer ${hoveredMuscle === 'quads' ? 'fill-orange-500 stroke-orange-400' : 'fill-slate-800/70 stroke-slate-700'} stroke-2`}
                      onMouseEnter={() => setHoveredMuscle('quads')}
                      onMouseLeave={() => setHoveredMuscle(null)} />
              </svg>
            </div>
          </div>

          {/* Details Panel Side */}
          <div className="md:col-span-7 space-y-4">
            {hoveredMuscle ? (
              <div className="space-y-4 p-6 bg-slate-950/80 border border-slate-900 rounded-2xl animate-fadeIn">
                <div>
                  <span className="text-xs text-orange-500 font-semibold uppercase tracking-wider">Grup Otot Aktif</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">{muscleInfo[hoveredMuscle].name}</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {muscleInfo[hoveredMuscle].description}
                </p>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latihan Pilihan GymBro</span>
                  <div className="flex flex-wrap gap-2">
                    {muscleInfo[hoveredMuscle].exercises.map((ex, i) => (
                      <span key={i} className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-6 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center h-48">
                <Activity className="h-8 w-8 text-slate-600 animate-pulse" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">Arahkan kursor ke anatomi tubuh</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">Lihat grup otot dada, bahu, perut, lengan, atau paha untuk mempelajari sasaran latihan yang tepat.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why GymBro / Benefits Section */}
      <section id="mengapa-gymbro" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 bg-slate-950">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Anda Tetap Milik Anda</h3>
            <p className="text-sm text-slate-400 leading-relaxed">GymBro dirancang di atas sistem keamanan terenkripsi. Catatan latihan Anda aman secara pribadi dan dimuat seketika.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Bebas Iklan & Pelacak</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Kami fokus sepenuhnya pada efisiensi latihan. Tanpa iklan pop-up, tanpa notifikasi media sosial, dan tanpa pelacak latar belakang.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Dibuat oleh Gym Bros</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Kami menginginkan aplikasi minimalis yang cepat untuk menggantikan buku catatan konvensional. Simpel, bersih, dan dioptimalkan untuk mobile web.</p>
          </div>
        </div>
      </section>

      {/* Testimonials / Stats */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-3xl p-8 md:p-12 text-center space-y-6">
          <div className="inline-flex p-3 rounded-full bg-orange-500/10 border border-orange-500/20 mx-auto">
            <Award className="h-6 w-6 text-orange-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white max-w-xl mx-auto">
            "GymBro benar-benar menggantikan buku catatan latihan saya. Proses mencatat bebannya sangat cepat."
          </h2>
          <div className="space-y-1">
            <span className="block text-sm font-bold text-white">Alex R.</span>
            <span className="block text-xs text-slate-400">Atlet Angkat Besi / Powerlifter</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Berhenti menduga-duga.
            <span className="block mt-2 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              Mulai catat perkembangan Anda.
            </span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Bergabunglah bersama ribuan pengangkat beban lainnya yang melacak volume latihan secara rutin, menjaga konsistensi latihan, dan memvisualisasikan progres tubuh mereka. Gratis 100%.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-base py-6 px-8 rounded-xl border-none shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] transition-all cursor-pointer">
                Buat Akun Gratis
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/40 text-slate-300 py-6 px-8 rounded-xl hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                Masuk ke Akun Anda
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <GymBroLogo className="h-8 w-8" />
            <span className="font-extrabold text-white text-lg tracking-tight">GymBro</span>
          </div>
          <p>© {new Date().getFullYear()} GymBro. Hak cipta dilindungi undang-undang. Teruslah berlatih.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-slate-300 cursor-pointer">Ketentuan Layanan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
