import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PWAInstaller } from '@/components/pwa-installer'

const inter = Inter({ subsets: ['latin'] })

const basePath = process.env.NODE_ENV === 'production' ? '/nagara-giki' : ''

export const metadata: Metadata = {
  title: 'ながら聞き',
  description: 'Google Driveの音楽をながら聞きできるPWAアプリ',
  manifest: `${basePath}/manifest.json`,
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: `${basePath}/icon.svg`,
    shortcut: `${basePath}/icon.svg`,
    apple: `${basePath}/icon-192.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ながら聞き',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* <PWAInstaller /> */}
        </Providers>
      </body>
    </html>
  )
} 