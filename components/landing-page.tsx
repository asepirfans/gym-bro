'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, RotateCcw, Dumbbell, CalendarDays, BookOpen, Timer, HeartHandshake } from 'lucide-react'
import { GymBroLogo } from '@/components/ui/gymbro-logo'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LandingPage() {
  const [sets, setSets] = useState([false, false, false])
  const completed = sets.filter(Boolean).length
  const volume = completed * 60 * 10

  return (
    <div className="landing">
      <a className="skip-link" href="#main-content">Langsung ke konten</a>
      <header className="landing-nav">
        <Link href="/" className="brand" aria-label="GymBro beranda"><GymBroLogo className="h-9 w-9" /><span>GymBro<span className="brand-dot">.</span></span></Link>
        <nav aria-label="Navigasi utama"><a href="#cara-kerja">Kenalan dulu</a><a href="#konsistensi">Lihat progres</a></nav>
        <div className="landing-nav-actions"><ThemeToggle /><Link href="/sign-in" className="landing-login">Masuk <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <h1>Teman latihan,<br />buat versi<br /><em>lebih kuatmu.</em></h1>
            <p className="hero-description">Datang ke gym dengan rencana. Pulang dengan catatan. GymBro bantu kamu mengingat setiap set, tanpa bikin latihan terasa ribet.</p>
            <div className="hero-actions"><Link href="/sign-up" className="landing-cta">Mulai bareng GymBro <ArrowUpRight size={18} aria-hidden="true" /></Link><a className="hero-demo-link" href="#demo-latihan">Coba catat satu set</a></div>
            <p className="hero-note">Nggak perlu sempurna. Cukup mulai dari satu sesi.</p>
          </div>
          <div className="hero-journal-wrap">
            <div className="hero-journal" id="demo-latihan">
              <div className="journal-top"><span><span className="journal-dot" /> Satu set lebih dekat</span><span>Demo interaktif</span></div>
              <div className="journal-title"><div><p>Sesi contoh / Upper body</p><h2>Bench press.</h2></div><Dumbbell aria-hidden="true" /></div>
              <div className="journal-target"><span>Target sesi</span><strong>3 set <span>×</span> 10 reps</strong></div>
              <div className="journal-table">
                <div className="journal-table-head"><span>Set</span><span>Beban</span><span>Reps</span><span>Selesai</span></div>
                {sets.map((done, index) => <div className={`journal-row ${done ? 'done' : ''}`} key={index}>
                  <span className="set-number">0{index + 1}</span><span>60 <small>kg</small></span><span>10</span>
                  <button aria-label={`${done ? 'Batalkan' : 'Tandai'} set ${index + 1} selesai`} aria-pressed={done} onClick={() => setSets(previous => previous.map((value, row) => row === index ? !value : value))}>{done ? <Check size={18} strokeWidth={2.5} /> : <span className="set-check-empty" />}</button>
                </div>)}
              </div>
              <div className="journal-bottom"><div><p>Volume tercatat</p><strong aria-live="polite">{volume.toLocaleString('id-ID')} <span>kg</span></strong></div><div className="journal-completion"><span>{completed} dari 3 set</span><div><span style={{ width: `${completed / 3 * 100}%` }} /></div></div></div>
              <div className="journal-footer"><p aria-live="polite">{completed === 3 ? 'Satu latihan selesai. Nice, Bro.' : 'Ketuk tanda selesai. Segampang itu.'}</p><button aria-label="Ulangi demo latihan" onClick={() => setSets([false, false, false])}><RotateCcw size={15} /></button></div>
              <p className="demo-disclaimer">Data contoh. Demo ini tidak disimpan ke akun.</p>
            </div>
            <p className="journal-note"><HeartHandshake size={17} aria-hidden="true" /> Catat usahanya. Hargai prosesnya.</p>
          </div>
        </section>
        <section className="training-principle" aria-label="Teman untuk setiap bagian latihan"><span><BookOpen size={19} aria-hidden="true" /> Rencana sesuai ritmemu</span><span><Dumbbell size={19} aria-hidden="true" /> Catatan di setiap set</span><span><CalendarDays size={19} aria-hidden="true" /> Progres yang bisa dilihat</span></section>
        <section className="landing-process" id="cara-kerja">
          <div className="process-intro"><p className="section-caption">Lebih sedikit nebak, lebih enak latihan</p><h2>Kamu fokus gerak.<br />Biar kami ingat<br />catatannya.</h2><p>Beban minggu lalu, jumlah repetisi, sampai kapan terakhir latihan. Semuanya punya tempat.</p></div>
          <div className="process-list">
            <article><BookOpen size={22} aria-hidden="true" /><div><h3>Rencana yang terasa punyamu.</h3><p>Susun gerakan favorit, coba template, atau pakai rutinitas yang dibagikan teman.</p></div></article>
            <article><Timer size={22} aria-hidden="true" /><div><h3>Ada ritme, ada jedanya.</h3><p>Catat beban dan repetisi, tandai set selesai, lalu istirahat dengan timer sebelum lanjut lagi.</p></div></article>
            <article><CalendarDays size={22} aria-hidden="true" /><div><h3>Usaha kecilnya kelihatan.</h3><p>Kalender menyimpan jejak sesi. Volume latihan dan rekor pribadi membantu kamu melihat apa yang sudah berubah.</p></div></article>
          </div>
        </section>
        <section className="landing-consistency" id="konsistensi">
          <div className="consistency-visual" aria-label="Ilustrasi kalender dengan data contoh">
            <div className="sample-calendar-heading"><CalendarDays size={19} aria-hidden="true" /><span>Satu hari, satu langkah.</span><small>Contoh</small></div>
            <div className="sample-week">{['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, index) => <span key={index}>{day}</span>)}</div>
            <div className="sample-days">{Array.from({ length: 28 }, (_, index) => { const active = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26].includes(index); return <span className={active ? 'active' : ''} key={index}>{index + 1}{active && <Check size={10} strokeWidth={3} aria-hidden="true" />}</span> })}</div>
            <p><Check size={13} aria-hidden="true" /> Tanda kecil untuk latihan yang sudah selesai.</p>
          </div>
          <div className="consistency-copy"><p className="section-caption">Balik lagi, sedikit lebih siap</p><h2>Konsisten itu<br />punya banyak<br /><em>bentuk.</em></h2><p>Sesi singkat juga tetap berarti. Lihat history di kalender, pilih tanggalnya, dan ingat lagi usaha yang sudah kamu buat.</p><Link href="/sign-up" className="landing-cta">Buat catatan pertamamu <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </section>
      </main>
      <footer className="landing-footer"><Link href="/" className="brand"><GymBroLogo className="h-7 w-7" /><span>GymBro.</span></Link><p>Teman catat, teman konsisten.</p><span>© {new Date().getFullYear()} GymBro</span></footer>
    </div>
  )
}
