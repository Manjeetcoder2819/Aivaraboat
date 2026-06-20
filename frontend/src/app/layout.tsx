import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'

import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/context/AuthContext'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AIVARA — AI Healthcare Assistant',
  description: 'AIVARA — Your intelligent, RAG-powered healthcare companion',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}