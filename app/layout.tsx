import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { DM_Sans, Geist_Mono, Fraunces } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/toast-provider'
import BottomNavigation from '@/components/bottom-navigation'
import { getSession } from '@/lib/simple-auth'
import { themeInitScript } from '@/lib/theme'

const geistSans = DM_Sans({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' })
const headingFont = Fraunces({ variable: '--font-athletic', subsets: ['latin'], display: 'swap' })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GymBro | Jurnal Latihan & Progres',
  description: 'Track your workouts, build routines, and monitor your fitness progress',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png?v=2', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png?v=2',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png?v=2',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} bg-background`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className="font-sans antialiased bg-slate-950 text-slate-50 min-h-screen">
        <div className="w-full min-h-screen bg-slate-950 flex flex-col relative pb-20 md:pb-0">
          <ToastProvider>
            {children}
            <BottomNavigation authenticated={!!session?.user} />
          </ToastProvider>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

