'use client'

import { useEffect, useState } from 'react'

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Service Worker登録
    if ('serviceWorker' in navigator) {
      const swPath = process.env.NODE_ENV === 'production' ? '/nagara-giki/sw.js' : '/sw.js'
      navigator.serviceWorker.register(swPath)
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // PWAインストールプロンプト
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">「ながら聞き」をインストール</h3>
          <p className="text-sm opacity-90">ホーム画面に追加して簡単にアクセス</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="px-3 py-1 text-sm bg-blue-700 rounded"
          >
            後で
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded font-semibold"
          >
            インストール
          </button>
        </div>
      </div>
    </div>
  )
} 