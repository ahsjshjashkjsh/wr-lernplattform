import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { FloatingChat } from '@/components/FloatingChat'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'WR Lernplattform – Abschlussprüfung',
  description: 'Lernplattform für Wirtschaft und Recht – Abschlussprüfung HMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full" suppressHydrationWarning>
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
            <div className="relative z-10">
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                {children}
              </main>
            </div>
            <FloatingChat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
