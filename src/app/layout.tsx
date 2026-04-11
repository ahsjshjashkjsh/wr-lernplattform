import type { Metadata } from 'next'
import Script from 'next/script'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingChat } from '@/components/FloatingChat'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { AdminMessagePopup } from '@/components/AdminMessagePopup'
import { AdminReplyPopup } from '@/components/AdminReplyPopup'
import { MaintenanceGate } from '@/components/MaintenanceGate'
import { AyriGate } from '@/components/AyriGate'

export const metadata: Metadata = {
  title: 'HMS-Plattform – Abschlussprüfung',
  description: 'HMS-Plattform für Wirtschaft und Recht – Abschlussprüfung HMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`h-full ${dmSans.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-full">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('wr-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');})()`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <AyriGate>
            <div className="relative z-10">
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <MaintenanceGate>{children}</MaintenanceGate>
              </main>
              <Footer />
            </div>
            <FloatingChat />
            <AdminMessagePopup />
            <AdminReplyPopup />
            </AyriGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
