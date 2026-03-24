import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingChat } from '@/components/FloatingChat'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { AdminMessagePopup } from '@/components/AdminMessagePopup'

export const metadata: Metadata = {
  title: 'HMS-Plattform – Abschlussprüfung',
  description: 'HMS-Plattform für Wirtschaft und Recht – Abschlussprüfung HMS',
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
              <Footer />
            </div>
            <FloatingChat />
            <AdminMessagePopup />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
