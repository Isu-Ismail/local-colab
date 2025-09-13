// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './_components/AuthProvider' // 1. Import it here

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Local Colab',
  description: 'Run code locally',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Wrap your children with the provider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}